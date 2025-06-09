// src/pages/MealPlanPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import { getUserFromToken } from '../utils/auth';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const ItemTypes = {
  MEAL: 'meal',
};

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

// Each meal slot now holds an object { id, title, image } or null
interface MealSlot {
  id: string;
  title: string;
  image: string;
  isPrivate?: boolean;
}

type WeeklyMeals = Record<string, Record<string, MealSlot | null>>;

// Initial sample: Monday has placeholder meals (with dummy IDs), others empty
const currentWeekMealsInitial: WeeklyMeals = {
  Monday: {
    Breakfast: {
      id: 'sample-avocado',
      title: 'Avocado Toast with Eggs',
      image: 'https://images.pexels.com/photos/704569/pexels-photo-704569.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    Lunch: {
      id: 'sample-caesar',
      title: 'Chicken Caesar Salad',
      image: 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    Dinner: {
      id: 'sample-shrimp',
      title: 'Spicy Shrimp Pasta',
      image: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    Snack: null,
  },
  Tuesday: { Breakfast: null, Lunch: null, Dinner: null, Snack: null },
  Wednesday: { Breakfast: null, Lunch: null, Dinner: null, Snack: null },
  Thursday: { Breakfast: null, Lunch: null, Dinner: null, Snack: null },
  Friday: { Breakfast: null, Lunch: null, Dinner: null, Snack: null },
  Saturday: { Breakfast: null, Lunch: null, Dinner: null, Snack: null },
  Sunday: { Breakfast: null, Lunch: null, Dinner: null, Snack: null },
};

// Helper: get Monday of the current week
function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  return date;
}

// Format date as e.g. "Jun 5"
function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Draggable MealItem now includes navigation on click
const MealItem: React.FC<{
  day: string;
  mealType: string;
  meal: MealSlot;
  onNavigate: (id: string) => void;
}> = ({ day, mealType, meal, onNavigate }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.MEAL,
    item: { day, mealType },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      role="button"
      aria-grabbed={isDragging}
      tabIndex={0}
      className={`flex items-center space-x-3 cursor-move select-none rounded-md p-1 transition-opacity duration-150 ${
        isDragging ? 'opacity-50' : 'opacity-100'
      } focus:outline-accent-500 focus:ring-2 focus:ring-accent-400`}
      title={`Drag to move ${mealType} on ${day}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onNavigate(meal.id);
        }
      }}
      onClick={() => onNavigate(meal.id)}
    >
      <div
        className="h-12 w-12 rounded-md bg-cover bg-center shadow-sm flex-shrink-0"
        style={{ backgroundImage: `url(${meal.image})` }}
        aria-label={`${meal.title} image`}
      />
      <span className="text-sm truncate max-w-xs">{meal.title}</span>
    </div>
  );
};

// Droppable cell with “Add” or existing MealItem
const DropCell: React.FC<{
  day: string;
  mealType: string;
  meal: MealSlot | null;
  onDropMeal: (fromDay: string, fromMealType: string, toDay: string, toMealType: string) => void;
  onOpenAddModal: (day: string, mealType: string) => void;
  onNavigate: (id: string) => void;
}> = ({ day, mealType, meal, onDropMeal, onOpenAddModal, onNavigate }) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ItemTypes.MEAL,
    drop: (item: { day: string; mealType: string }) => {
      if (item.day !== day || item.mealType !== mealType) {
        onDropMeal(item.day, item.mealType, day, mealType);
      }
    },
    canDrop: (item: { day: string; mealType: string }) =>
      !(item.day === day && item.mealType === mealType),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));

  return (
    <td
      ref={drop}
      className={`px-3 py-2 whitespace-nowrap align-top cursor-pointer min-w-[130px] rounded-md transition-colors duration-150 ${
        isOver && canDrop ? 'bg-green-100 ring-2 ring-green-400' : 'hover:bg-gray-50'
      }`}
      aria-label={`${mealType} on ${day} ${meal ? `with meal ${meal.title}` : 'empty'}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          if (meal) {
            onNavigate(meal.id);
          } else {
            onOpenAddModal(day, mealType);
          }
        }
      }}
      onClick={() => {
        if (meal) {
          onNavigate(meal.id);
        } else {
          onOpenAddModal(day, mealType);
        }
      }}
    >
      {meal ? (
        <MealItem day={day} mealType={mealType} meal={meal} onNavigate={onNavigate} />
      ) : (
        <button
          type="button"
          className="flex items-center space-x-1 text-sm text-accent-600 hover:text-accent-700 focus:outline-accent-500 focus:ring-2 focus:ring-accent-400"
          aria-label={`Add ${mealType} for ${day}`}
          onClick={(e) => {
            e.stopPropagation();
            onOpenAddModal(day, mealType);
          }}
        >
          <Plus size={16} />
          <span className="truncate max-w-[100px]">Add {mealType}</span>
        </button>
      )}
    </td>
  );
};

const MealPlanPage: React.FC = () => {
  const navigate = useNavigate();

  const [currentMonday, setCurrentMonday] = useState(getMonday(new Date()));
  const [currentSunday, setCurrentSunday] = useState(() => {
    const sunday = new Date(currentMonday);
    sunday.setDate(sunday.getDate() + 6);
    return sunday;
  });
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Load existing meal plan from localStorage (or default)
  const [meals, setMeals] = useState<WeeklyMeals>(() => {
    try {
      const saved = localStorage.getItem('mealPlan');
      if (saved) return JSON.parse(saved);
    } catch {}
    return currentWeekMealsInitial;
  });

  // Modal state, plus fetched recipe list
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDay, setModalDay] = useState('');
  const [modalMealType, setModalMealType] = useState('');
  const [availableRecipes, setAvailableRecipes] = useState<{ _id: string; title: string; image: string }[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [recipeError, setRecipeError] = useState<string | null>(null);

  // Persist meals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mealPlan', JSON.stringify(meals));
  }, [meals]);

  // Recalculate currentSunday if week changes
  useEffect(() => {
    const sunday = new Date(currentMonday);
    sunday.setDate(sunday.getDate() + 6);
    setCurrentSunday(sunday);
  }, [currentMonday]);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch all recipes from backend when opening the modal
  const fetchAvailableRecipes = async () => {
    setLoadingRecipes(true);
    setRecipeError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setRecipeError('Authentication required');
        return;
      }

      const userData = getUserFromToken();
      if (!userData?.id) {
        setRecipeError('User not found');
        return;
      }

      const res = await fetch(`${API_BASE}/api/recipes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch recipes');
      }

      const recipes = await res.json();
      const userRecipes = recipes.filter((recipe: any) => {
        const recipeUserId = (typeof recipe.user === 'object' && recipe.user !== null) ? recipe.user._id : recipe.user;
        const recipeCreatorId = recipe.createdBy?._id;
        return String(recipeUserId) === String(userData.id) || String(recipeCreatorId) === String(userData.id);
      });

      const simplified = userRecipes.map((r: any) => ({
        _id: r._id,
        title: r.title,
        image: r.image || 'https://via.placeholder.com/100',
        isPrivate: r.isPrivate || false
      }));
      
      setAvailableRecipes(simplified);
    } catch (err: any) {
      setRecipeError(err.message || 'Error fetching recipes');
    } finally {
      setLoadingRecipes(false);
    }
  };

  // Open “Add Recipe” modal for a particular day & mealType
  const openAddModal = (day: string, mealType: string) => {
    setModalDay(day);
    setModalMealType(mealType);
    setAvailableRecipes([]);
    setModalOpen(true);
    fetchAvailableRecipes();
  };

  // Save chosen recipe into that day/mealType slot, including its ID
  const addRecipeToMeal = (recipe: { _id: string; title: string; image: string; isPrivate?: boolean }) => {
    setMeals((prev) => {
      const updated = { ...prev };
      updated[modalDay] = {
        ...updated[modalDay],
        [modalMealType]: {
          id: recipe._id,
          title: recipe.title,
          image: recipe.image || 'https://via.placeholder.com/100',
          isPrivate: recipe.isPrivate || false
        },
      };
      return updated;
    });
    setModalOpen(false);
  };

  // Redirect to recipe detail page
  const goToRecipeDetail = (recipeId: string) => {
    navigate(`/recipedetail/${recipeId}`);
  };

  // Navigation: previous/next week
  const goToPreviousWeek = () => {
    setCurrentMonday((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };
  const goToNextWeek = () => {
    setCurrentMonday((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  // Identify “today” in the week header
  const todayName = daysOfWeek[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const dateRangeString = `${formatDate(currentMonday)} - ${formatDate(
    currentSunday
  )}, ${currentMonday.getFullYear()}`;
  const clockString = currentDateTime.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
  });

  // Handle drag & drop logic
  const onDropMeal = useCallback(
    (fromDay: string, fromMealType: string, toDay: string, toMealType: string) => {
      setMeals((prevMeals) => {
        const newMeals = { ...prevMeals };
        const dragged = newMeals[fromDay]?.[fromMealType] ?? null;
        if (!dragged) return prevMeals;
        newMeals[toDay] = { ...newMeals[toDay], [toMealType]: dragged };
        newMeals[fromDay] = { ...newMeals[fromDay], [fromMealType]: null };
        return newMeals;
      });
    },
    []
  );

  // Clear entire week’s meals
  const clearAllMeals = () => {
    if (window.confirm('Are you sure you want to clear all meals for this week?')) {
      setMeals(() => {
        const cleared: WeeklyMeals = {} as WeeklyMeals;
        daysOfWeek.forEach((day) => {
          cleared[day] = {} as Record<string, MealSlot | null>;
          mealTypes.forEach((mt) => (cleared[day][mt] = null));
        });
        return cleared;
      });
    }
  };

  // Modal JSX
  const AddMealModal = () => {
    if (!modalOpen) return null;
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={() => setModalOpen(false)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setModalOpen(false);
        }}
      >
        <div
          className="bg-white rounded-md p-6 max-w-lg w-full max-h-[80vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 id="modal-title" className="text-lg font-semibold">
              Select Recipe for {modalMealType} on {modalDay}
            </h2>
            <button
              type="button"
              className="text-gray-600 hover:text-gray-900"
              aria-label="Close modal"
              onClick={() => setModalOpen(false)}
            >
              <X size={24} />
            </button>
          </div>

          {loadingRecipes && <p className="text-center text-gray-600">Loading recipes...</p>}
          {recipeError && <p className="text-red-600 text-center">{recipeError}</p>}

          {!loadingRecipes && !recipeError && availableRecipes.length === 0 && (
            <p className="text-center text-gray-500">No recipes found.</p>
          )}

          <ul className="space-y-2">
            {availableRecipes.map((recipe) => (
              <li
                key={recipe._id}
                onClick={() => addRecipeToMeal(recipe)} 
                className="cursor-pointer border rounded p-3 flex items-center gap-4 hover:bg-gray-100"
              >
                {recipe.image ? (
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-300 rounded flex items-center justify-center text-gray-600">
                    No Image
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-800">{recipe.title}</h3>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        <main className="container mx-auto px-4 py-6" role="main" aria-label="Meal Plan">
          <SectionHeading title="Meal Plan" />

          {/* Week Navigation */}
          <nav
            className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-3 sm:space-y-0"
            aria-label="Week navigation"
          >
            <button
              onClick={goToPreviousWeek}
              className="btn flex items-center space-x-1 bg-white border border-gray-300 hover:bg-gray-100 px-3 py-2 rounded-md text-sm focus:outline-accent-500 focus:ring-2 focus:ring-accent-400"
              aria-label="Previous Week"
            >
              <ChevronLeft size={18} />
              <span>Previous Week</span>
            </button>

            <div className="text-center">
              <h3
                className="text-lg sm:text-xl font-semibold truncate max-w-xs sm:max-w-none"
                aria-live="polite"
                aria-atomic="true"
              >
                {dateRangeString}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 truncate max-w-xs sm:max-w-none">
                {clockString}
              </p>
            </div>

            <button
              onClick={goToNextWeek}
              className="btn flex items-center space-x-1 bg-white border border-gray-300 hover:bg-gray-100 px-3 py-2 rounded-md text-sm focus:outline-accent-500 focus:ring-2 focus:ring-accent-400"
              aria-label="Next Week"
            >
              <span>Next Week</span>
              <ChevronRight size={18} />
            </button>
          </nav>

          {/* Meal Plan Grid */}
          <section className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <table
              className="min-w-[700px] sm:min-w-full divide-y divide-gray-200"
              role="grid"
              aria-label="Weekly meal plan"
            >
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24"
                  >
                    Meal
                  </th>
                  {daysOfWeek.map((day) => (
                    <th
                      key={day}
                      scope="col"
                      className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        day === todayName
                          ? 'text-accent-700 border-b-4 border-accent-600'
                          : 'text-gray-500'
                      }`}
                      aria-current={day === todayName ? 'date' : undefined}
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mealTypes.map((mealType) => (
                  <tr key={mealType}>
                    <th
                      scope="row"
                      className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50"
                    >
                      {mealType}
                    </th>

                    {daysOfWeek.map((day) => {
                      const meal = meals[day][mealType];
                      return (
                        <DropCell
                          key={`${day}-${mealType}`}
                          day={day}
                          mealType={mealType}
                          meal={meal}
                          onDropMeal={onDropMeal}
                          onOpenAddModal={openAddModal}
                          onNavigate={goToRecipeDetail}
                        />
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <button
            type="button"
            onClick={clearAllMeals}
            className="mt-6 inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm focus:outline-accent-500 focus:ring-2 focus:ring-accent-400"
            aria-label="Clear all meals for this week"
          >
            Clear All Meals
          </button>

          {AddMealModal()}
        </main> 
      </div>
    </DndProvider>
  );
};

export default MealPlanPage;
