import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { GIFEncoder, quantize, applyPalette } from 'gifenc';

const SPEED_OPTIONS = [
    { label: '1x', value: 1 },
    { label: '2x', value: 2 },
    { label: '5x', value: 5 },
    { label: '10x', value: 10 },
    { label: '25x', value: 25 },
    { label: '50x', value: 50 },
];

const EXPORT_FORMATS = [
    { id: 'gif', label: 'GIF', icon: '\uD83D\uDDBC\uFE0F', ext: 'gif' },
    { id: 'webm', label: 'WebM', icon: '\uD83C\uDFAC', ext: 'webm' },
    { id: 'mp4', label: 'MP4', icon: '\uD83C\uDFA5', ext: 'mp4' },
];

/**
 * Distribute snapshots uniformly: each snapshot gets equal screen time.
 * Total duration = 500ms per snapshot (before speed multiplier).
 * This gives a smooth, evenly-paced timelapse regardless of actual drawing time.
 */
const FRAME_DURATION = 500; // ms per snapshot (at 1x speed)
const distributeSnapshots = (snapshots) => {
    if (!snapshots || snapshots.length === 0) return [];
    return snapshots.map((snap, i) => ({
        ...snap,
        t: (i + 1) * FRAME_DURATION,
    }));
};

/**
 * Timelapse replay modal — snapshot-based.
 * Receives JPEG snapshots captured during drawing, replays as animation.
 * 100% pixel-perfect since snapshots are the actual canvas state.
 */
const TimelapseReplay = ({ snapshots: rawSnapshots, strokeCount, templateSrc, canvasSize, onClose }) => {
    const snapshots = useMemo(() => distributeSnapshots(rawSnapshots), [rawSnapshots]);

    const canvasRef = useRef(null);
    const snapshotImgsRef = useRef([]);
    const templateImgRef = useRef(null);
    const animFrameRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(10);
    const [progress, setProgress] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [exportReady, setExportReady] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);
    const [exportFormat, setExportFormat] = useState('gif');
    const [exportProgress, setExportProgress] = useState(0);

    const totalDuration = snapshots.length > 0 ? snapshots[snapshots.length - 1].t : 0;

    // Preload template + all snapshot images
    useEffect(() => {
        if (!snapshots || snapshots.length === 0) {
            // No snapshots — just load template
            if (templateSrc) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    templateImgRef.current = img;
                    setLoaded(true);
                    drawImageOnCanvas(img);
                };
                img.src = templateSrc;
            }
            return;
        }

        let loadedCount = 0;
        const totalToLoad = snapshots.length + 1; // +1 for template
        const imgs = new Array(snapshots.length);

        const onOneLoaded = () => {
            loadedCount++;
            setLoadProgress(loadedCount / totalToLoad);
            if (loadedCount >= totalToLoad) {
                snapshotImgsRef.current = imgs;
                setLoaded(true);
                // Show final result on open
                const lastImg = imgs[imgs.length - 1];
                if (lastImg) drawImageOnCanvas(lastImg);
                else if (templateImgRef.current) drawImageOnCanvas(templateImgRef.current);
            }
        };

        // Load template as frame 0 (before any drawing)
        const tImg = new Image();
        tImg.crossOrigin = 'anonymous';
        tImg.onload = () => { templateImgRef.current = tImg; onOneLoaded(); };
        tImg.onerror = onOneLoaded;
        tImg.src = templateSrc;

        // Load snapshot images
        snapshots.forEach((snap, i) => {
            const img = new Image();
            img.onload = () => { imgs[i] = img; onOneLoaded(); };
            img.onerror = onOneLoaded;
            img.src = snap.data;
        });
    }, [snapshots, templateSrc]);

    // Draw a single image onto the display canvas
    const drawImageOnCanvas = useCallback((img) => {
        const canvas = canvasRef.current;
        if (!canvas || !img) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }, []);

    // Get the snapshot image for a given time
    const getFrameAtTime = useCallback((time) => {
        if (snapshots.length === 0) return templateImgRef.current;
        if (time <= 0) return templateImgRef.current;

        const imgs = snapshotImgsRef.current;
        // Find latest snapshot with t <= time
        for (let i = snapshots.length - 1; i >= 0; i--) {
            if (snapshots[i].t <= time && imgs[i]) return imgs[i];
        }
        return templateImgRef.current;
    }, [snapshots]);

    // Play animation
    const play = useCallback(() => {
        if (snapshots.length === 0 || totalDuration === 0) return;

        setIsPlaying(true);
        setProgress(0);

        // Show template first
        if (templateImgRef.current) drawImageOnCanvas(templateImgRef.current);

        const startReal = performance.now();

        const tick = () => {
            const elapsed = (performance.now() - startReal) * speed;
            const pct = Math.min(1, elapsed / totalDuration);
            setProgress(pct);

            const frameImg = getFrameAtTime(elapsed);
            if (frameImg) drawImageOnCanvas(frameImg);

            if (pct < 1) {
                animFrameRef.current = requestAnimationFrame(tick);
            } else {
                setIsPlaying(false);
                // Show final frame
                const lastImg = snapshotImgsRef.current[snapshotImgsRef.current.length - 1];
                if (lastImg) drawImageOnCanvas(lastImg);
                if (mediaRecorderRef.current?.state === 'recording') {
                    mediaRecorderRef.current.stop();
                }
            }
        };

        animFrameRef.current = requestAnimationFrame(tick);
    }, [snapshots, totalDuration, speed, drawImageOnCanvas, getFrameAtTime]);

    // Stop
    const stop = useCallback(() => {
        if (animFrameRef.current) {
            cancelAnimationFrame(animFrameRef.current);
            animFrameRef.current = null;
        }
        setIsPlaying(false);
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    }, []);

    // Export as WebM (MediaRecorder — records the play animation)
    const exportWebM = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        chunksRef.current = [];
        setExportReady(null);
        setIsRecording(true);
        setExportProgress(0);

        const stream = canvas.captureStream(30);
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
            ? 'video/webm;codecs=vp9' : 'video/webm';
        const recorder = new MediaRecorder(stream, {
            mimeType,
            videoBitsPerSecond: 5000000,
        });

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            setExportReady({ url: URL.createObjectURL(blob), ext: 'webm' });
            setIsRecording(false);
        };

        mediaRecorderRef.current = recorder;
        recorder.start();
        play();
    }, [play]);

    // Export as GIF (gifenc — max 4s, 10fps, 480px downscale)
    const exportGIF = useCallback(async () => {
        const canvas = canvasRef.current;
        if (!canvas || snapshots.length === 0 || totalDuration === 0) return;

        setExportReady(null);
        setIsRecording(true);
        setExportProgress(0);

        // Downscale for GIF
        const maxGifDim = 480;
        const srcW = canvas.width;
        const srcH = canvas.height;
        const scale = Math.min(1, maxGifDim / Math.max(srcW, srcH));
        const gifW = Math.round(srcW * scale);
        const gifH = Math.round(srcH * scale);

        const downCanvas = document.createElement('canvas');
        downCanvas.width = gifW;
        downCanvas.height = gifH;
        const downCtx = downCanvas.getContext('2d');
        downCtx.imageSmoothingEnabled = true;
        downCtx.imageSmoothingQuality = 'medium';

        const gif = GIFEncoder();
        const fps = 10;
        const maxDuration = 4000;
        const maxFrames = fps * (maxDuration / 1000);
        const totalFrames = Math.min(maxFrames, Math.max(snapshots.length, 10));
        const frameInterval = totalDuration / totalFrames;

        for (let i = 0; i <= totalFrames; i++) {
            const t = i * frameInterval;
            const frameImg = getFrameAtTime(t);

            downCtx.clearRect(0, 0, gifW, gifH);
            if (i === 0 && templateImgRef.current) {
                downCtx.drawImage(templateImgRef.current, 0, 0, gifW, gifH);
            } else if (frameImg) {
                downCtx.drawImage(frameImg, 0, 0, gifW, gifH);
            }

            const imageData = downCtx.getImageData(0, 0, gifW, gifH);
            const palette = quantize(imageData.data, 256);
            const indexed = applyPalette(imageData.data, palette);
            gif.writeFrame(indexed, gifW, gifH, { palette, delay: Math.round(1000 / fps) });

            setExportProgress(i / totalFrames);
            if (i % 5 === 0) await new Promise(r => setTimeout(r, 0));
        }

        gif.finish();
        const blob = new Blob([gif.bytes()], { type: 'image/gif' });
        setExportReady({ url: URL.createObjectURL(blob), ext: 'gif' });
        setIsRecording(false);
        setExportProgress(1);
    }, [snapshots, totalDuration, speed, getFrameAtTime]);

    // Export as MP4 (mp4-muxer + VideoEncoder)
    const exportMP4 = useCallback(async () => {
        const canvas = canvasRef.current;
        if (!canvas || snapshots.length === 0 || totalDuration === 0) return;

        if (typeof VideoEncoder === 'undefined') {
            alert('MP4 export requires Chrome 94+ or Edge 94+. Use WebM or GIF instead.');
            return;
        }

        setExportReady(null);
        setIsRecording(true);
        setExportProgress(0);

        const { Muxer, ArrayBufferTarget } = await import('mp4-muxer');

        // H.264 requires even dimensions
        const w = canvas.width % 2 === 0 ? canvas.width : canvas.width - 1;
        const h = canvas.height % 2 === 0 ? canvas.height : canvas.height - 1;

        const encCanvas = document.createElement('canvas');
        encCanvas.width = w;
        encCanvas.height = h;
        const encCtx = encCanvas.getContext('2d');

        const fps = 30;
        const totalFrames = Math.min(600, Math.max(snapshots.length * 3, 30));
        const frameInterval = totalDuration / totalFrames;

        const target = new ArrayBufferTarget();
        const muxer = new Muxer({
            target,
            video: { codec: 'avc', width: w, height: h },
            fastStart: 'in-memory',
        });

        const encoder = new VideoEncoder({
            output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
            error: (e) => console.error('VideoEncoder error:', e),
        });

        encoder.configure({
            codec: 'avc1.640028',
            width: w,
            height: h,
            bitrate: 5_000_000,
            framerate: fps,
        });

        try {
            for (let i = 0; i <= totalFrames; i++) {
                const t = i * frameInterval;
                const frameImg = getFrameAtTime(t);

                encCtx.clearRect(0, 0, w, h);
                if (i === 0 && templateImgRef.current) {
                    encCtx.drawImage(templateImgRef.current, 0, 0, w, h);
                } else if (frameImg) {
                    encCtx.drawImage(frameImg, 0, 0, w, h);
                }

                const frame = new VideoFrame(encCanvas, {
                    timestamp: i * (1_000_000 / fps),
                    duration: 1_000_000 / fps,
                });
                encoder.encode(frame, { keyFrame: i % 30 === 0 });
                frame.close();

                setExportProgress(i / totalFrames);
                if (i % 10 === 0) {
                    await encoder.flush();
                    await new Promise(r => setTimeout(r, 0));
                }
            }

            await encoder.flush();
            encoder.close();
            muxer.finalize();

            const blob = new Blob([target.buffer], { type: 'video/mp4' });
            setExportReady({ url: URL.createObjectURL(blob), ext: 'mp4' });
        } catch (err) {
            console.error('MP4 export failed:', err);
            alert('MP4 export failed. Try WebM or GIF instead.');
        }
        setIsRecording(false);
        setExportProgress(1);
    }, [snapshots, totalDuration, getFrameAtTime]);

    const startExport = useCallback(() => {
        if (exportFormat === 'gif') exportGIF();
        else if (exportFormat === 'mp4') exportMP4();
        else exportWebM();
    }, [exportFormat, exportGIF, exportMP4, exportWebM]);

    const downloadVideo = useCallback(() => {
        if (!exportReady) return;
        const a = document.createElement('a');
        a.href = exportReady.url;
        a.download = `drawberu-timelapse-${Date.now()}.${exportReady.ext}`;
        a.click();
    }, [exportReady]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            if (exportReady?.url) URL.revokeObjectURL(exportReady.url);
        };
    }, [exportReady]);

    // Canvas display size (fit in modal)
    const maxDisplay = 600;
    const ratio = canvasSize.width / canvasSize.height;
    const displayW = ratio >= 1 ? maxDisplay : Math.round(maxDisplay * ratio);
    const displayH = ratio >= 1 ? Math.round(maxDisplay / ratio) : maxDisplay;

    const formatTime = (ms) => {
        const s = Math.floor(ms / 1000);
        const m = Math.floor(s / 60);
        return `${m}:${String(s % 60).padStart(2, '0')}`;
    };

    const hasSnapshots = snapshots.length > 0;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-[#1a1a2e] rounded-xl border border-purple-500/30 p-5 max-w-[700px] w-full mx-4 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="text-2xl">{'\uD83C\uDFAC'}</span> Timelapse Replay
                    </h2>
                    <button onClick={onClose}
                        className="text-gray-400 hover:text-white text-xl px-2">{'\u2715'}</button>
                </div>

                {/* Canvas */}
                <div className="relative flex justify-center mb-4 bg-white/5 rounded-lg p-2">
                    <canvas
                        ref={canvasRef}
                        width={canvasSize.width}
                        height={canvasSize.height}
                        style={{ width: displayW, height: displayH }}
                        className="rounded shadow-lg"
                    />
                    {/* Loading overlay */}
                    {hasSnapshots && !loaded && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-lg">
                            <div className="text-white text-sm font-bold mb-3">
                                Chargement des frames...
                            </div>
                            <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-150"
                                    style={{ width: `${loadProgress * 100}%` }} />
                            </div>
                            <div className="text-gray-400 text-xs mt-2">
                                {Math.round(loadProgress * 100)}% ({Math.round(loadProgress * (snapshots.length + 1))}/{snapshots.length + 1})
                            </div>
                        </div>
                    )}
                </div>

                {/* Playback progress bar */}
                {hasSnapshots && loaded && (
                    <div className="mb-4">
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-100"
                                style={{ width: `${progress * 100}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>{Math.round(progress * snapshots.length)}/{snapshots.length}</span>
                            <span>{strokeCount || snapshots.length} traits</span>
                            <span>{formatTime(totalDuration / speed)}</span>
                        </div>
                    </div>
                )}

                {/* Controls */}
                {hasSnapshots ? (
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Play / Stop */}
                        <button
                            onClick={isPlaying ? stop : play}
                            disabled={!loaded}
                            className="px-4 py-2 rounded-lg font-bold text-sm bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 transition-colors">
                            {isPlaying ? '\u23F9 Stop' : '\u25B6 Play'}
                        </button>

                        {/* Speed selector */}
                        <div className="flex items-center gap-1">
                            {SPEED_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => setSpeed(opt.value)}
                                    className={`px-2 py-1 rounded text-xs font-mono transition-colors ${
                                        speed === opt.value
                                            ? 'bg-pink-600 text-white'
                                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                    }`}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1" />

                        {/* Format selector */}
                        <div className="flex items-center gap-1">
                            {EXPORT_FORMATS.map(fmt => (
                                <button
                                    key={fmt.id}
                                    onClick={() => { setExportFormat(fmt.id); setExportReady(null); }}
                                    disabled={isRecording}
                                    className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                                        exportFormat === fmt.id
                                            ? 'bg-pink-600 text-white'
                                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                    } disabled:opacity-40`}
                                    title={fmt.id === 'mp4' ? 'Chrome/Edge 94+' : undefined}>
                                    {fmt.icon} {fmt.label}
                                </button>
                            ))}
                        </div>

                        {/* Export / Download */}
                        {exportReady ? (
                            <button onClick={downloadVideo}
                                className="px-4 py-2 rounded-lg font-bold text-sm bg-green-600 hover:bg-green-500 text-white transition-colors">
                                {'\uD83D\uDCE5'} Download .{exportReady.ext}
                            </button>
                        ) : (
                            <button
                                onClick={startExport}
                                disabled={isPlaying || isRecording}
                                className="px-4 py-2 rounded-lg font-bold text-sm bg-pink-600 hover:bg-pink-500 text-white disabled:opacity-40 transition-colors">
                                {isRecording
                                    ? `\u23FA ${Math.round(exportProgress * 100)}%`
                                    : `Export ${EXPORT_FORMATS.find(f => f.id === exportFormat)?.label}`}
                            </button>
                        )}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 text-sm mt-3">
                        Aucun trait enregistre dans cette session. Dessine quelque chose d'abord !
                    </p>
                )}
            </div>
        </div>
    );
};

export default TimelapseReplay;
