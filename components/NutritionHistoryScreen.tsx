
import React, { useState } from 'react';
import { LoggedFood, NutritionGoals } from '../types';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface NutritionHistoryScreenProps {
    onClose: () => void;
    log: LoggedFood[];
    goals: NutritionGoals;
}

type Metric = 'calories' | 'protein' | 'carbs' | 'fat';

const generateHistoryData = (log: LoggedFood[], goals: NutritionGoals) => {
    const history: { dayLabel: string; nutrition: LoggedFood['nutrition']; isToday: boolean }[] = [];
    
    for (let i = 6; i > 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        // Generate slightly random data around the goal for realism
        const nutrition = {
            calories: goals.calories * (0.8 + Math.random() * 0.4),
            protein: goals.protein * (0.7 + Math.random() * 0.5),
            carbs: goals.carbs * (0.7 + Math.random() * 0.6),
            fat: goals.fat * (0.8 + Math.random() * 0.4),
        };
        history.push({ 
            dayLabel: date.toLocaleDateString('en-US', { weekday: 'short' }), 
            nutrition: {
                calories: Math.round(nutrition.calories),
                protein: Math.round(nutrition.protein),
                carbs: Math.round(nutrition.carbs),
                fat: Math.round(nutrition.fat),
            },
            isToday: false 
        });
    }

    const todayNutrition = log.reduce((acc, item) => {
        acc.calories += item.nutrition.calories;
        acc.protein += item.nutrition.protein;
        acc.carbs += item.nutrition.carbs;
        acc.fat += item.nutrition.fat;
        return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    history.push({ 
        dayLabel: 'Today', 
        nutrition: {
            calories: Math.round(todayNutrition.calories),
            protein: Math.round(todayNutrition.protein),
            carbs: Math.round(todayNutrition.carbs),
            fat: Math.round(todayNutrition.fat),
        },
        isToday: true 
    });
    
    return history;
};

const BarChart: React.FC<{ data: any[], metric: Metric, goal: number, color: string }> = ({ data, metric, goal, color }) => {
    const maxValue = Math.max(goal, ...data.map(h => h.nutrition[metric])) * 1.15;
    
    return (
        <div className="relative h-48 w-full">
            {/* Goal Line */}
            <div className="absolute left-0 right-0 h-px bg-gray-300 border-t border-dashed border-gray-400 z-10" style={{ bottom: maxValue > 0 ? `${(goal / maxValue) * 100}%` : '0%' }}>
                <span className="absolute -right-0 -translate-y-1/2 text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-1 rounded">Goal: {goal}</span>
            </div>
            
            <div className="flex h-full justify-between items-end pt-6 pb-6 px-2">
                {data.map((day, index) => {
                    const value = day.nutrition[metric];
                    const barHeight = maxValue > 0 ? (value / maxValue) * 100 : 0;
                    return (
                        <div key={index} className="flex flex-col items-center group w-1/7 h-full justify-end">
                            <div className={`text-[10px] font-bold text-gray-700 dark:text-gray-200 mb-1 opacity-0 group-hover:opacity-100 transition-opacity`}>
                                {Math.round(value)}
                            </div>
                            <div 
                                className={`w-2.5 sm:w-4 rounded-t-md transition-all duration-500 ${day.isToday ? 'bg-violet-500' : color}`}
                                style={{ height: `${Math.max(barHeight, 2)}%` }}
                            ></div>
                            <div className="mt-2 text-[10px] text-gray-500 font-semibold">{day.dayLabel.charAt(0)}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const MacroPieChart: React.FC<{ protein: number, carbs: number, fat: number }> = ({ protein, carbs, fat }) => {
    const total = protein + carbs + fat;
    if (total === 0) return <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">No Data</div>;

    const pPct = (protein / total) * 100;
    const cPct = (carbs / total) * 100;
    const fPct = (fat / total) * 100;

    // Simple CSS Conic Gradient for Pie Chart
    const background = `conic-gradient(
        #0ea5e9 0% ${pPct}%, 
        #f59e0b ${pPct}% ${pPct + cPct}%, 
        #ec4899 ${pPct + cPct}% 100%
    )`;

    return (
        <div className="relative w-32 h-32 rounded-full shadow-inner" style={{ background }}>
            <div className="absolute inset-4 bg-white dark:bg-gray-800 rounded-full flex flex-col items-center justify-center">
                <span className="text-xs text-gray-500 font-medium">Total</span>
                <span className="text-sm font-bold text-gray-800 dark:text-white">{(total * 4).toFixed(0)} cal</span> {/* Approximation */}
            </div>
        </div>
    );
}

const NutritionHistoryScreen: React.FC<NutritionHistoryScreenProps> = ({ onClose, log, goals }) => {
    const [activeMetric, setActiveMetric] = useState<Metric>('calories');
    const historyData = generateHistoryData(log, goals);
    
    const metricConfig = {
        calories: { label: 'Calories', unit: 'kcal', color: 'bg-green-500', goal: goals.calories },
        protein: { label: 'Protein', unit: 'g', color: 'bg-sky-500', goal: goals.protein },
        carbs: { label: 'Carbs', unit: 'g', color: 'bg-amber-500', goal: goals.carbs },
        fat: { label: 'Fat', unit: 'g', color: 'bg-pink-500', goal: goals.fat },
    };

    // Calculate Weekly Averages
    const weeklyAvg = Math.round(historyData.reduce((sum, day) => sum + day.nutrition[activeMetric], 0) / historyData.length);
    
    // Avg Macros for Pie Chart
    const avgProtein = historyData.reduce((sum, d) => sum + d.nutrition.protein, 0) / 7;
    const avgCarbs = historyData.reduce((sum, d) => sum + d.nutrition.carbs, 0) / 7;
    const avgFat = historyData.reduce((sum, d) => sum + d.nutrition.fat, 0) / 7;

    return (
        <div className="absolute inset-0 bg-gray-50 dark:bg-gray-950 z-40 flex flex-col animate-slide-in">
            <header className="flex items-center p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <button onClick={onClose} className="p-2 -ml-2 mr-2">
                    <ArrowLeftIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
                <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Nutrition Trends</h1>
            </header>

            <div className="flex-grow p-4 overflow-y-auto space-y-6">
                {/* Weekly Summary Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                         <h2 className="font-bold text-gray-800 dark:text-white">Last 7 Days</h2>
                         <select 
                            value={activeMetric} 
                            onChange={(e) => setActiveMetric(e.target.value as Metric)}
                            className="bg-gray-100 dark:bg-gray-700 border-none text-sm font-semibold rounded-lg py-1 px-3 focus:ring-0"
                        >
                             <option value="calories">Calories</option>
                             <option value="protein">Protein</option>
                             <option value="carbs">Carbs</option>
                             <option value="fat">Fat</option>
                         </select>
                    </div>
                    
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">{weeklyAvg}</span>
                        <span className="text-sm font-medium text-gray-500">{metricConfig[activeMetric].unit} / day avg</span>
                    </div>

                    <div className="w-full bg-gray-50 dark:bg-gray-900 rounded-xl p-2">
                         <BarChart 
                            data={historyData} 
                            metric={activeMetric} 
                            goal={metricConfig[activeMetric].goal} 
                            color={metricConfig[activeMetric].color} 
                        />
                    </div>
                </div>

                {/* Macro Distribution */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-6">
                     <div className="flex-1">
                        <h2 className="font-bold text-gray-800 dark:text-white mb-4">Weekly Macro Split</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-sky-500"></div>
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Protein</span>
                                </div>
                                <span className="text-sm font-bold text-gray-800 dark:text-white">{Math.round(avgProtein)}g</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Carbs</span>
                                </div>
                                <span className="text-sm font-bold text-gray-800 dark:text-white">{Math.round(avgCarbs)}g</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Fat</span>
                                </div>
                                <span className="text-sm font-bold text-gray-800 dark:text-white">{Math.round(avgFat)}g</span>
                            </div>
                        </div>
                     </div>
                     <div className="flex-shrink-0">
                        <MacroPieChart protein={avgProtein} carbs={avgCarbs} fat={avgFat} />
                     </div>
                </div>
            </div>

            <style>{`
                @keyframes slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
                .animate-slide-in { animation: slide-in 0.3s ease-out; }
            `}</style>
        </div>
    );
};

export default NutritionHistoryScreen;
