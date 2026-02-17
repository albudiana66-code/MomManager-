export interface User {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
  created_at: string;
}

export interface Meeting {
  id: string;
  user_id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  description?: string;
  color: string;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Checklist {
  id: string;
  user_id: string;
  date: string;
  items: ChecklistItem[];
  created_at: string;
}

export interface BudgetCategory {
  name: string;
  budget: number;
  spent: number;
}

export interface Budget {
  id: string;
  user_id: string;
  month: string;
  categories: BudgetCategory[];
  created_at: string;
}

export interface ReceiptItem {
  name: string;
  price: number;
}

export interface ParsedReceipt {
  store?: string;
  date?: string;
  items: ReceiptItem[];
  total?: number;
}

export interface Receipt {
  id: string;
  user_id: string;
  image_base64: string;
  parsed_data: ParsedReceipt;
  category?: string;
  created_at: string;
}

export interface DayMeal {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
}

export interface ShoppingItem {
  item: string;
  quantity: string;
  checked: boolean;
}

export interface MealPlan {
  id: string;
  user_id: string;
  week_start: string;
  adult_meals: DayMeal[];
  kid_meals: DayMeal[];
  shopping_list: ShoppingItem[];
  created_at: string;
}

export interface Activity {
  id: string;
  name: string;
  date: string;
  notes?: string;
}

export interface Milestone {
  id: string;
  name: string;
  date?: string;
  achieved: boolean;
}

export interface Kid {
  id: string;
  user_id: string;
  kid_name: string;
  birth_date?: string;
  activities: Activity[];
  milestones: Milestone[];
  created_at: string;
}

export interface Exercise {
  name: string;
  duration: string;
  reps?: string;
}

export interface WorkoutRoutine {
  id: string;
  name: string;
  duration: string;
  exercises: Exercise[];
}

export interface NutritionPlan {
  goal: string;
  daily_calories: number;
  meals: string[];
}

export interface SelfCare {
  id: string;
  user_id: string;
  nutrition_plan?: NutritionPlan;
  workout_routines: WorkoutRoutine[];
  created_at: string;
}
