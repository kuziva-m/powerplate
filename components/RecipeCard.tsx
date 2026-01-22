
import React from 'react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
      <h3 className="text-xl font-bold text-gray-900 mb-2">{recipe.name}</h3>
      <p className="text-sm text-gray-600 italic mb-4">"{recipe.culturalNote}"</p>
      
      <div className="mb-4">
        <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2">Ingredients</h4>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
        </ul>
      </div>

      <div className="mb-4">
        <h4 className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2">Steps</h4>
        <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
          {recipe.steps.map((step, i) => <li key={i}>{step}</li>)}
        </ol>
      </div>

      <div className="bg-green-50 rounded-lg p-3">
        <h4 className="text-xs font-bold text-green-800 uppercase tracking-wider mb-2">Healthy Meal Pairing</h4>
        <div className="flex flex-wrap gap-2 mb-2">
          {recipe.healthyPairings.map((p, i) => (
            <span key={i} className="px-2 py-1 bg-white text-green-700 text-xs font-medium rounded-full border border-green-200">{p}</span>
          ))}
        </div>
        <p className="text-xs text-green-700 leading-relaxed italic">{recipe.mealBalanceReason}</p>
      </div>
    </div>
  );
};
