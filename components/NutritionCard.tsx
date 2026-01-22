
import React from 'react';
import { Nutrients } from '../types';

interface NutritionCardProps {
  nutrients: Nutrients;
  language: string;
}

export const NutritionCard: React.FC<NutritionCardProps> = ({ nutrients, language }) => {
  const labels = {
    en: { calories: 'Calories', protein: 'Protein', carbs: 'Carbohydrates', fiber: 'Fiber', vitamins: 'Vitamins', minerals: 'Minerals' },
    sn: { calories: 'Masimba (Calories)', protein: 'Mapuroteni', carbs: 'Makovahydrates', fiber: 'Zvimedu', vitamins: 'Mavhitamini', minerals: 'Zvicherwa (Minerals)' },
    nd: { calories: 'Amandla (Calories)', protein: 'Ama-protein', carbs: 'Ama-carbohydrates', fiber: 'I-fiber', vitamins: 'Ama-vitamins', minerals: 'Ama-minerals' }
  }[language] || { calories: 'Calories', protein: 'Protein', carbs: 'Carbs', fiber: 'Fiber', vitamins: 'Vitamins', minerals: 'Minerals' };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 overflow-hidden">
      <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Nutritional Values</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <p className="text-xs text-green-700 uppercase font-semibold">{labels.calories}</p>
          <p className="text-lg font-bold text-green-900">{nutrients.calories}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <p className="text-xs text-blue-700 uppercase font-semibold">{labels.protein}</p>
          <p className="text-lg font-bold text-blue-900">{nutrients.protein}</p>
        </div>
        <div className="bg-amber-50 p-3 rounded-lg text-center">
          <p className="text-xs text-amber-700 uppercase font-semibold">{labels.carbs}</p>
          <p className="text-lg font-bold text-amber-900">{nutrients.carbs}</p>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg text-center">
          <p className="text-xs text-purple-700 uppercase font-semibold">{labels.fiber}</p>
          <p className="text-lg font-bold text-purple-900">{nutrients.fiber}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-bold text-gray-700 mb-2">{labels.vitamins}</h4>
          <div className="flex flex-wrap gap-2">
            {nutrients.vitamins.map((v, i) => (
              <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">{v}</span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-700 mb-2">{labels.minerals}</h4>
          <div className="flex flex-wrap gap-2">
            {nutrients.minerals.map((m, i) => (
              <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">{m}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
