import React, { useMemo, useState } from 'react';
import podData from '../../data/podData';
import PodPreviewLayout from '../GuideEditor/PodPreviewLayout';
import CarouselPod from './CarouselPod';

export default function GuidePOD() {
  const [selectedPod, setSelectedPod] = useState(null);
  const now = new Date();

  // Utilitaire pour parser les dates ISO
  const parseDate = (str) => new Date(str);

  // Trier le podData pour le carousel
  const sortedPodData = useMemo(() => {
    return [...podData].sort((a, b) => {
      const dateA = parseDate(a.testDateRange?.startDate || '1970-01-01');
      const dateB = parseDate(b.testDateRange?.startDate || '1970-01-01');
      const scoreA = Number(a.score || 0);
      const scoreB = Number(b.score || 0);

      if (dateA.getTime() !== dateB.getTime()) {
        return dateB - dateA; // plus récent d’abord
      }
      return scoreB - scoreA; // meilleur score ensuite
    });
  }, []);

  // Fiche en haut : la meilleure dans la semaine courante ou fallback
  const bestPodThisWeek = useMemo(() => {
    const podsInRange = podData.filter(pod => {
      if (!pod.testDateRange?.startDate || !pod.testDateRange?.endDate) return false;
      const start = parseDate(pod.testDateRange.startDate);
      const end = parseDate(pod.testDateRange.endDate);
      return now >= start && now <= end;
    });

    const pool = podsInRange.length > 0 ? podsInRange : podData;

    return pool
      .sort((a, b) => {
        const dateA = parseDate(a.testDateRange?.startDate || '1970-01-01');
        const dateB = parseDate(b.testDateRange?.startDate || '1970-01-01');
        const scoreA = Number(a.score || 0);
        const scoreB = Number(b.score || 0);

        if (dateA.getTime() !== dateB.getTime()) {
          return dateB - dateA;
        }
        return scoreB - scoreA;
      })[0];
  }, [podData]);

  return (
    <div className="min-h-screen p-4 bg-gray-950 text-white flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-6 text-center">Preview for PoD Guide</h2>

      <CarouselPod data={sortedPodData} onSelect={setSelectedPod} />

      <div className="w-full max-w-6xl flex flex-col gap-6 items-center">
        <PodPreviewLayout formData={selectedPod || bestPodThisWeek} />
      </div>
    </div>
  );
}
