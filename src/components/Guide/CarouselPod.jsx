import React, { useState, useEffect } from "react";
import { bossData } from "../../data/itemData";

export default function CarouselPOD({ data, onSelect }) {
    const [visibleCards, setVisibleCards] = useState(3);
    const [startIndex, setStartIndex] = useState(0);
    const [selectedLevel, setSelectedLevel] = useState("All");
    const [selectedWeek, setSelectedWeek] = useState("This Week");

    const playerLevels = [
        "Whale", "Dolphin", "LowSpender D1", "Free2Play D1", "ComeBack player", "New Player"
    ];

    const cardWidth = 280;
    const spacing = 16;

    useEffect(() => {
        const updateVisibleCards = () => {
            const width = window.innerWidth;
            if (width < 640) setVisibleCards(1);
            else if (width < 1024) setVisibleCards(2);
            else setVisibleCards(3);
        };
        updateVisibleCards();
        window.addEventListener("resize", updateVisibleCards);
        return () => window.removeEventListener("resize", updateVisibleCards);
    }, []);

    const getWeekRanges = (entries) => {
        const allDates = entries
            .map((pod) => new Date(pod.testDateRange?.startDate))
            .filter((d) => !isNaN(d));

        const uniqueWeeks = new Map();

        for (const date of allDates) {
            const current = new Date(date);
            const day = current.getDay();
            const diffToThursday = (day >= 4 ? day - 4 : 7 - (4 - day));
            const thursday = new Date(current);
            thursday.setDate(current.getDate() - diffToThursday);
            thursday.setHours(0, 0, 0, 0);
            const wed = new Date(thursday);
            wed.setDate(thursday.getDate() + 6);
            const label = `${thursday.toLocaleDateString()} - ${wed.toLocaleDateString()}`;
            const value = thursday.toISOString();
            uniqueWeeks.set(value, { label, value, start: thursday, end: wed });
        }

        const now = new Date();
        const todayDay = now.getDay();
        const lastThursday = new Date(now);
        lastThursday.setDate(now.getDate() - ((todayDay >= 4) ? todayDay - 4 : 7 - (4 - todayDay)));
        lastThursday.setHours(0, 0, 0, 0);
        const thisWednesday = new Date(lastThursday);
        thisWednesday.setDate(lastThursday.getDate() + 6);

        return {
            weeks: [...uniqueWeeks.values()],
            currentRange: { start: lastThursday, end: thisWednesday }
        };
    };

    const { weeks, currentRange } = getWeekRanges(data);

    const selectedRange =
        selectedWeek === "This Week"
            ? currentRange
            : weeks.find((w) => w.value === selectedWeek);

    const filteredByWeek = data.filter((pod) => {
        const date = new Date(pod.testDateRange?.startDate);
        if (isNaN(date) || !selectedRange) return false;
        return date >= selectedRange.start && date <= selectedRange.end;
    });

    const filteredData = selectedLevel === "All"
        ? filteredByWeek
        : filteredByWeek.filter((pod) => pod.level === selectedLevel);

    const formatScore = (score) => {
        const s = Number(score || 0);
        if (s >= 1_000_000_000) return (s / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
        if (s >= 1_000_000) return (s / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
        return s.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    };

    const wrapperWidth = visibleCards * cardWidth + spacing * (visibleCards - 1);

    return (
        <div className="flex flex-col items-center gap-4 p-4 w-full">
            <div className="flex flex-wrap justify-center gap-4">
                <select
                    value={selectedLevel}
                    onChange={(e) => {
                        setSelectedLevel(e.target.value);
                        setStartIndex(0);
                    }}
                    className="px-3 py-1 rounded-md bg-[#1a1a1a] text-white border border-purple-500 hover:border-purple-400 transition"
                >
                    <option value="All">Tous les niveaux</option>
                    {playerLevels.map((lvl) => (
                        <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                </select>

                <select
                    value={selectedWeek}
                    onChange={(e) => {
                        setSelectedWeek(e.target.value);
                        setStartIndex(0);
                    }}
                    className="px-3 py-1 rounded-md bg-[#1a1a1a] text-white border border-purple-500 hover:border-purple-400 transition"
                >
                    <option value="This Week">This Week</option>
                    {weeks
                        .sort((a, b) => b.start - a.start)
                        .filter(w => {
                            const now = new Date();
                            const currentDay = now.getDay();
                            const diffToThursday = (currentDay >= 4 ? currentDay - 4 : 7 - (4 - currentDay));
                            const currentThursday = new Date(now);
                            currentThursday.setDate(now.getDate() - diffToThursday);
                            currentThursday.setHours(0, 0, 0, 0);
                            return w.start.getTime() !== currentThursday.getTime(); // filtre le doublon
                        })
                        .map(({ label, value }) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                </select>
            </div>

            <div className="flex items-center justify-center gap-2 mt-2">
                <button
                    onClick={() => startIndex > 0 && setStartIndex(startIndex - 1)}
                    disabled={startIndex === 0}
                    className={`text-2xl px-2 transition ${startIndex === 0
                        ? "text-gray-500 cursor-not-allowed"
                        : "text-white hover:text-purple-400"}`}
                >
                    ◀
                </button>

                <div className="overflow-hidden" style={{ width: `${wrapperWidth}px` }}>
                    <div
                        className="flex gap-4 transition-transform duration-500 ease-in-out"
                        style={{
                            transform: `translateX(-${startIndex * (cardWidth + spacing)}px)`
                        }}
                    >
                        {filteredData.map((pod, index) => {
                            const bossInfo = bossData.find(
                                (boss) => boss.name.toLowerCase() === pod.boss?.toLowerCase()
                            );

                            return (
                                <div
                                    key={index}
                                    onClick={() => onSelect && onSelect(pod)}
                                    className="cursor-pointer relative flex-shrink-0 bg-[#1a1a1a] rounded-lg border border-white transform transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_15px_#9333ea]"
                                    style={{ width: `${cardWidth}px`, height: "100px" }}
                                >
                                    <div className="flex w-full h-full text-white p-2">
                                        <div className="flex flex-col justify-between w-1/2 pr-2">
                                            <div className="text-base font-bold">{pod.pseudo}</div>
                                            <div className="text-xs">Score : {formatScore(pod.score)}</div>
                                            <div className="text-xs mb-1">Niveau : {pod.level}</div>
                                            <div className="text-xs text-gray-300 mt-auto">
                                                {bossInfo?.name || pod.boss}
                                            </div>
                                        </div>

                                        {bossInfo?.src && (
                                            <div className="relative w-1/2 flex items-center justify-center">
                                                <img
                                                    src={bossInfo.src}
                                                    alt={bossInfo.name}
                                                    className="w-[90%] h-auto object-contain rounded-md z-0"
                                                />
                                                <img
                                                    src="https://res.cloudinary.com/dbg7m8qjd/image/upload/v1749054035/cadre_ojwsaz.png"
                                                    alt="Cadre"
                                                    className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <button
                    onClick={() => startIndex + visibleCards < filteredData.length && setStartIndex(startIndex + 1)}
                    disabled={startIndex + visibleCards >= filteredData.length}
                    className={`text-2xl px-2 transition ${startIndex + visibleCards >= filteredData.length
                        ? "text-gray-500 cursor-not-allowed"
                        : "text-white hover:text-purple-400"}`}
                >
                    ▶
                </button>
            </div>
        </div>
    );
}
