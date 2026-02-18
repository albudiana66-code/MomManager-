from fastapi import FastAPI, HTTPException, Depends, Request, Response, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
import os
import uuid
import httpx
import base64
from dotenv import load_dotenv

load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="MomManager 2026 API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "test_database")
EMERGENT_LLM_KEY = os.getenv("EMERGENT_LLM_KEY")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# ============== Pydantic Models ==============

# Auth Models
class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime

class SessionDataResponse(BaseModel):
    id: str
    email: str
    name: str
    picture: Optional[str] = None
    session_token: str

# Meeting Models
class MeetingCreate(BaseModel):
    title: str
    date: str
    start_time: str
    end_time: str
    description: Optional[str] = ""
    color: Optional[str] = "#6366f1"

class Meeting(BaseModel):
    id: str
    user_id: str
    title: str
    date: str
    start_time: str
    end_time: str
    description: Optional[str] = ""
    color: str
    created_at: datetime

# Checklist Models
class ChecklistItem(BaseModel):
    id: str
    text: str
    completed: bool = False

class ChecklistCreate(BaseModel):
    date: str
    items: List[ChecklistItem]

class Checklist(BaseModel):
    id: str
    user_id: str
    date: str
    items: List[ChecklistItem]
    created_at: datetime

# Budget Models
class BudgetCategory(BaseModel):
    name: str
    budget: float
    spent: float = 0

class BudgetCreate(BaseModel):
    month: str
    categories: List[BudgetCategory]

class Budget(BaseModel):
    id: str
    user_id: str
    month: str
    categories: List[BudgetCategory]
    created_at: datetime

# Receipt Models
class ReceiptItem(BaseModel):
    name: str
    price: float

class ParsedReceipt(BaseModel):
    store: Optional[str] = None
    date: Optional[str] = None
    items: List[ReceiptItem] = []
    total: Optional[float] = None

class Receipt(BaseModel):
    id: str
    user_id: str
    image_base64: str
    parsed_data: ParsedReceipt
    category: Optional[str] = None
    created_at: datetime

# Meal Plan Models
class DayMeal(BaseModel):
    day: str
    breakfast: str
    lunch: str
    dinner: str

class ShoppingItem(BaseModel):
    item: str
    quantity: str
    checked: bool = False

class MealPlanCreate(BaseModel):
    week_start: str
    adult_meals: List[DayMeal]
    kid_meals: List[DayMeal]
    shopping_list: List[ShoppingItem]

class MealPlan(BaseModel):
    id: str
    user_id: str
    week_start: str
    adult_meals: List[DayMeal]
    kid_meals: List[DayMeal]
    shopping_list: List[ShoppingItem]
    created_at: datetime

# Kid Activities Models
class Activity(BaseModel):
    id: str
    name: str
    date: str
    notes: Optional[str] = ""

class Milestone(BaseModel):
    id: str
    name: str
    date: Optional[str] = None
    achieved: bool = False

class KidCreate(BaseModel):
    kid_name: str
    birth_date: Optional[str] = None

class Kid(BaseModel):
    id: str
    user_id: str
    kid_name: str
    birth_date: Optional[str] = None
    activities: List[Activity] = []
    milestones: List[Milestone] = []
    created_at: datetime

# Self-Care Models
class Exercise(BaseModel):
    name: str
    duration: str
    reps: Optional[str] = None

class WorkoutRoutine(BaseModel):
    id: str
    name: str
    duration: str
    exercises: List[Exercise]

class NutritionPlan(BaseModel):
    goal: str
    daily_calories: int
    meals: List[str]

class SelfCare(BaseModel):
    id: str
    user_id: str
    nutrition_plan: Optional[NutritionPlan] = None
    workout_routines: List[WorkoutRoutine] = []
    created_at: datetime

# ============== Helper Functions ==============

async def get_current_user(request: Request) -> Optional[User]:
    """Get current user from session token"""
    session_token = request.cookies.get("session_token")
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        return None
    
    session = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session:
        return None
    
    expires_at = session.get("expires_at")
    if expires_at:
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            return None
    
    user_doc = await db.users.find_one(
        {"user_id": session["user_id"]},
        {"_id": 0}
    )
    
    if user_doc:
        return User(**user_doc)
    return None

async def require_auth(request: Request) -> User:
    """Require authentication"""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

# ============== Auth Endpoints ==============

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "app": "MomManager 2026"}

@app.post("/api/auth/session")
async def exchange_session(request: Request, response: Response):
    """Exchange session_id for session data and set cookie"""
    session_id = request.headers.get("X-Session-ID")
    if not session_id:
        raise HTTPException(status_code=400, detail="Missing session ID")
    
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": session_id}
            )
            if res.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session")
            
            user_data = res.json()
        except Exception as e:
            raise HTTPException(status_code=401, detail=f"Auth error: {str(e)}")
    
    # Check if user exists
    existing_user = await db.users.find_one(
        {"email": user_data["email"]},
        {"_id": 0}
    )
    
    if existing_user:
        user_id = existing_user["user_id"]
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": user_data["email"],
            "name": user_data["name"],
            "picture": user_data.get("picture"),
            "created_at": datetime.now(timezone.utc)
        })
    
    # Create session
    session_token = user_data["session_token"]
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc)
    })
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 60 * 60
    )
    
    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return user_doc

@app.get("/api/auth/me")
async def get_me(current_user: User = Depends(require_auth)):
    """Get current user"""
    return current_user

@app.post("/api/auth/logout")
async def logout(request: Request, response: Response):
    """Logout user"""
    session_token = request.cookies.get("session_token")
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out"}

# ============== Meetings Endpoints ==============

@app.get("/api/meetings")
async def get_meetings(current_user: User = Depends(require_auth)):
    """Get all meetings for user"""
    meetings = await db.meetings.find(
        {"user_id": current_user.user_id},
        {"_id": 0}
    ).to_list(1000)
    return meetings

@app.post("/api/meetings")
async def create_meeting(meeting: MeetingCreate, current_user: User = Depends(require_auth)):
    """Create a new meeting"""
    meeting_doc = {
        "id": f"meet_{uuid.uuid4().hex[:12]}",
        "user_id": current_user.user_id,
        "title": meeting.title,
        "date": meeting.date,
        "start_time": meeting.start_time,
        "end_time": meeting.end_time,
        "description": meeting.description,
        "color": meeting.color,
        "created_at": datetime.now(timezone.utc)
    }
    await db.meetings.insert_one(meeting_doc)
    meeting_doc.pop("_id", None)
    return meeting_doc

@app.put("/api/meetings/{meeting_id}")
async def update_meeting(meeting_id: str, meeting: MeetingCreate, current_user: User = Depends(require_auth)):
    """Update a meeting"""
    result = await db.meetings.update_one(
        {"id": meeting_id, "user_id": current_user.user_id},
        {"$set": {
            "title": meeting.title,
            "date": meeting.date,
            "start_time": meeting.start_time,
            "end_time": meeting.end_time,
            "description": meeting.description,
            "color": meeting.color
        }}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return {"message": "Meeting updated"}

@app.delete("/api/meetings/{meeting_id}")
async def delete_meeting(meeting_id: str, current_user: User = Depends(require_auth)):
    """Delete a meeting"""
    result = await db.meetings.delete_one({"id": meeting_id, "user_id": current_user.user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return {"message": "Meeting deleted"}

# ============== Checklists Endpoints ==============

@app.get("/api/checklists")
async def get_checklists(date: Optional[str] = None, current_user: User = Depends(require_auth)):
    """Get checklists for user"""
    query = {"user_id": current_user.user_id}
    if date:
        query["date"] = date
    checklists = await db.checklists.find(query, {"_id": 0}).to_list(1000)
    return checklists

@app.post("/api/checklists")
async def create_checklist(checklist: ChecklistCreate, current_user: User = Depends(require_auth)):
    """Create or update a checklist"""
    existing = await db.checklists.find_one(
        {"user_id": current_user.user_id, "date": checklist.date}
    )
    
    if existing:
        await db.checklists.update_one(
            {"user_id": current_user.user_id, "date": checklist.date},
            {"$set": {"items": [item.dict() for item in checklist.items]}}
        )
        updated = await db.checklists.find_one(
            {"user_id": current_user.user_id, "date": checklist.date},
            {"_id": 0}
        )
        return updated
    
    checklist_doc = {
        "id": f"check_{uuid.uuid4().hex[:12]}",
        "user_id": current_user.user_id,
        "date": checklist.date,
        "items": [item.dict() for item in checklist.items],
        "created_at": datetime.now(timezone.utc)
    }
    await db.checklists.insert_one(checklist_doc)
    return {k: v for k, v in checklist_doc.items() if k != "_id"}

# ============== Budget Endpoints ==============

@app.get("/api/budgets")
async def get_budgets(month: Optional[str] = None, current_user: User = Depends(require_auth)):
    """Get budgets for user"""
    query = {"user_id": current_user.user_id}
    if month:
        query["month"] = month
    budgets = await db.budgets.find(query, {"_id": 0}).to_list(100)
    return budgets

@app.post("/api/budgets")
async def create_budget(budget: BudgetCreate, current_user: User = Depends(require_auth)):
    """Create or update a budget"""
    existing = await db.budgets.find_one(
        {"user_id": current_user.user_id, "month": budget.month}
    )
    
    if existing:
        await db.budgets.update_one(
            {"user_id": current_user.user_id, "month": budget.month},
            {"$set": {"categories": [cat.dict() for cat in budget.categories]}}
        )
        updated = await db.budgets.find_one(
            {"user_id": current_user.user_id, "month": budget.month},
            {"_id": 0}
        )
        return updated
    
    budget_doc = {
        "id": f"budget_{uuid.uuid4().hex[:12]}",
        "user_id": current_user.user_id,
        "month": budget.month,
        "categories": [cat.dict() for cat in budget.categories],
        "created_at": datetime.now(timezone.utc)
    }
    await db.budgets.insert_one(budget_doc)
    return {k: v for k, v in budget_doc.items() if k != "_id"}

# ============== Receipts Endpoints ==============

@app.get("/api/receipts")
async def get_receipts(current_user: User = Depends(require_auth)):
    """Get all receipts for user"""
    receipts = await db.receipts.find(
        {"user_id": current_user.user_id},
        {"_id": 0}
    ).to_list(1000)
    return receipts

@app.post("/api/receipts/scan")
async def scan_receipt(request: Request, current_user: User = Depends(require_auth)):
    """Scan receipt with AI"""
    body = await request.json()
    image_base64 = body.get("image_base64")
    
    if not image_base64:
        raise HTTPException(status_code=400, detail="No image provided")
    
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="AI service not configured")
    
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"receipt_{uuid.uuid4().hex[:8]}",
        system_message="""You are a receipt scanner. Extract the following from the receipt image:
- Store name
- Date
- List of items with prices
- Total amount

Return ONLY valid JSON in this format:
{
    "store": "Store Name",
    "date": "YYYY-MM-DD",
    "items": [{"name": "Item 1", "price": 10.99}],
    "total": 50.99
}
If you cannot read something, use null."""
    ).with_model("openai", "gpt-5.2")
    
    user_message = UserMessage(
        text=f"Please analyze this receipt image and extract the data. The image is in base64 format: {image_base64[:500]}..."
    )
    
    try:
        response = await chat.send_message(user_message)
        import json
        
        # Try to parse JSON from response
        try:
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0]
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0]
            else:
                json_str = response
            
            parsed_data = json.loads(json_str.strip())
        except:
            parsed_data = {
                "store": None,
                "date": None,
                "items": [],
                "total": None
            }
        
        receipt_doc = {
            "id": f"receipt_{uuid.uuid4().hex[:12]}",
            "user_id": current_user.user_id,
            "image_base64": image_base64,
            "parsed_data": parsed_data,
            "category": None,
            "created_at": datetime.now(timezone.utc)
        }
        await db.receipts.insert_one(receipt_doc)
        return {k: v for k, v in receipt_doc.items() if k != "_id"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI processing error: {str(e)}")

@app.delete("/api/receipts/{receipt_id}")
async def delete_receipt(receipt_id: str, current_user: User = Depends(require_auth)):
    """Delete a receipt"""
    result = await db.receipts.delete_one({"id": receipt_id, "user_id": current_user.user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Receipt not found")
    return {"message": "Receipt deleted"}

# ============== Meal Plan Endpoints ==============

@app.get("/api/mealplans")
async def get_meal_plans(current_user: User = Depends(require_auth)):
    """Get all meal plans for user"""
    plans = await db.mealplans.find(
        {"user_id": current_user.user_id},
        {"_id": 0}
    ).to_list(100)
    return plans

@app.post("/api/mealplans/generate")
async def generate_meal_plan(request: Request, current_user: User = Depends(require_auth)):
    """Generate meal plan with AI"""
    body = await request.json()
    preferences = body.get("preferences", {})
    
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="AI service not configured")
    
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"mealplan_{uuid.uuid4().hex[:8]}",
        system_message="""You are a meal planning assistant for busy moms. Create balanced, easy-to-prepare meals.
Return ONLY valid JSON in this format:
{
    "adult_meals": [
        {"day": "Monday", "breakfast": "...", "lunch": "...", "dinner": "..."},
        ...for all 7 days
    ],
    "kid_meals": [
        {"day": "Monday", "breakfast": "...", "lunch": "...", "dinner": "..."},
        ...for all 7 days
    ],
    "shopping_list": [
        {"item": "Item name", "quantity": "2 kg"},
        ...
    ]
}
Kid meals should be simpler and more kid-friendly."""
    ).with_model("openai", "gpt-5.2")
    
    prompt = f"""Create a weekly meal plan for a family.
Adult preferences: {preferences.get('adult_preferences', 'healthy, balanced meals')}
Kid preferences: {preferences.get('kid_preferences', 'kid-friendly, simple meals')}
Dietary restrictions: {preferences.get('restrictions', 'none')}
Number of adults: {preferences.get('num_adults', 2)}
Number of kids: {preferences.get('num_kids', 1)}"""
    
    user_message = UserMessage(text=prompt)
    
    try:
        response = await chat.send_message(user_message)
        import json
        
        try:
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0]
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0]
            else:
                json_str = response
            
            plan_data = json.loads(json_str.strip())
        except:
            raise HTTPException(status_code=500, detail="Failed to parse AI response")
        
        from datetime import date
        today = date.today()
        monday = today - timedelta(days=today.weekday())
        
        mealplan_doc = {
            "id": f"meal_{uuid.uuid4().hex[:12]}",
            "user_id": current_user.user_id,
            "week_start": monday.isoformat(),
            "adult_meals": plan_data.get("adult_meals", []),
            "kid_meals": plan_data.get("kid_meals", []),
            "shopping_list": plan_data.get("shopping_list", []),
            "created_at": datetime.now(timezone.utc)
        }
        await db.mealplans.insert_one(mealplan_doc)
        return {k: v for k, v in mealplan_doc.items() if k != "_id"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI processing error: {str(e)}")

@app.put("/api/mealplans/{plan_id}")
async def update_meal_plan(plan_id: str, plan: MealPlanCreate, current_user: User = Depends(require_auth)):
    """Update a meal plan"""
    result = await db.mealplans.update_one(
        {"id": plan_id, "user_id": current_user.user_id},
        {"$set": {
            "adult_meals": [m.dict() for m in plan.adult_meals],
            "kid_meals": [m.dict() for m in plan.kid_meals],
            "shopping_list": [s.dict() for s in plan.shopping_list]
        }}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Meal plan not found")
    return {"message": "Meal plan updated"}

@app.delete("/api/mealplans/{plan_id}")
async def delete_meal_plan(plan_id: str, current_user: User = Depends(require_auth)):
    """Delete a meal plan"""
    result = await db.mealplans.delete_one({"id": plan_id, "user_id": current_user.user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Meal plan not found")
    return {"message": "Meal plan deleted"}

# ============== Kids Endpoints ==============

@app.get("/api/kids")
async def get_kids(current_user: User = Depends(require_auth)):
    """Get all kids for user"""
    kids = await db.kids.find(
        {"user_id": current_user.user_id},
        {"_id": 0}
    ).to_list(100)
    return kids

@app.post("/api/kids")
async def create_kid(kid: KidCreate, current_user: User = Depends(require_auth)):
    """Add a new kid"""
    kid_doc = {
        "id": f"kid_{uuid.uuid4().hex[:12]}",
        "user_id": current_user.user_id,
        "kid_name": kid.kid_name,
        "birth_date": kid.birth_date,
        "activities": [],
        "milestones": [],
        "created_at": datetime.now(timezone.utc)
    }
    await db.kids.insert_one(kid_doc)
    return {k: v for k, v in kid_doc.items() if k != "_id"}

@app.post("/api/kids/{kid_id}/activities")
async def add_activity(kid_id: str, activity: Activity, current_user: User = Depends(require_auth)):
    """Add activity to kid"""
    activity_dict = activity.dict()
    activity_dict["id"] = f"act_{uuid.uuid4().hex[:8]}"
    
    result = await db.kids.update_one(
        {"id": kid_id, "user_id": current_user.user_id},
        {"$push": {"activities": activity_dict}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Kid not found")
    return activity_dict

@app.post("/api/kids/{kid_id}/milestones")
async def add_milestone(kid_id: str, milestone: Milestone, current_user: User = Depends(require_auth)):
    """Add milestone to kid"""
    milestone_dict = milestone.dict()
    milestone_dict["id"] = f"mile_{uuid.uuid4().hex[:8]}"
    
    result = await db.kids.update_one(
        {"id": kid_id, "user_id": current_user.user_id},
        {"$push": {"milestones": milestone_dict}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Kid not found")
    return milestone_dict

@app.put("/api/kids/{kid_id}/milestones/{milestone_id}")
async def update_milestone(kid_id: str, milestone_id: str, request: Request, current_user: User = Depends(require_auth)):
    """Update milestone"""
    body = await request.json()
    
    result = await db.kids.update_one(
        {"id": kid_id, "user_id": current_user.user_id, "milestones.id": milestone_id},
        {"$set": {
            "milestones.$.achieved": body.get("achieved", False),
            "milestones.$.date": body.get("date")
        }}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Milestone not found")
    return {"message": "Milestone updated"}

@app.delete("/api/kids/{kid_id}")
async def delete_kid(kid_id: str, current_user: User = Depends(require_auth)):
    """Delete a kid"""
    result = await db.kids.delete_one({"id": kid_id, "user_id": current_user.user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Kid not found")
    return {"message": "Kid deleted"}

# ============== Self-Care Endpoints ==============

@app.get("/api/selfcare")
async def get_selfcare(current_user: User = Depends(require_auth)):
    """Get self-care data for user"""
    selfcare = await db.selfcare.find_one(
        {"user_id": current_user.user_id},
        {"_id": 0}
    )
    if not selfcare:
        selfcare = {
            "id": f"self_{uuid.uuid4().hex[:12]}",
            "user_id": current_user.user_id,
            "nutrition_plan": None,
            "workout_routines": [],
            "created_at": datetime.now(timezone.utc)
        }
        await db.selfcare.insert_one(selfcare)
        selfcare.pop("_id", None)
    return selfcare

@app.post("/api/selfcare/nutrition/generate")
async def generate_nutrition_plan(request: Request, current_user: User = Depends(require_auth)):
    """Generate nutrition plan with AI"""
    body = await request.json()
    
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="AI service not configured")
    
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"nutrition_{uuid.uuid4().hex[:8]}",
        system_message="""You are a nutrition expert for busy working moms. Create personalized nutrition plans.
Return ONLY valid JSON in this format:
{
    "goal": "weight loss/maintenance/energy boost",
    "daily_calories": 1800,
    "meals": [
        "Breakfast: ...",
        "Snack: ...",
        "Lunch: ...",
        "Snack: ...",
        "Dinner: ..."
    ]
}
Keep meals simple, quick to prepare, and nutritious."""
    ).with_model("openai", "gpt-5.2")
    
    prompt = f"""Create a nutrition plan for a working mom.
Goal: {body.get('goal', 'maintain energy and healthy weight')}
Age: {body.get('age', '30')}
Activity level: {body.get('activity_level', 'moderate')}
Dietary restrictions: {body.get('restrictions', 'none')}
Time for cooking: {body.get('cooking_time', '30 minutes or less')}"""
    
    user_message = UserMessage(text=prompt)
    
    try:
        response = await chat.send_message(user_message)
        import json
        
        try:
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0]
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0]
            else:
                json_str = response
            
            nutrition_data = json.loads(json_str.strip())
        except:
            raise HTTPException(status_code=500, detail="Failed to parse AI response")
        
        await db.selfcare.update_one(
            {"user_id": current_user.user_id},
            {"$set": {"nutrition_plan": nutrition_data}},
            upsert=True
        )
        
        return nutrition_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI processing error: {str(e)}")

@app.post("/api/selfcare/workout/generate")
async def generate_workout(request: Request, current_user: User = Depends(require_auth)):
    """Generate workout routine with AI"""
    body = await request.json()
    
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="AI service not configured")
    
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"workout_{uuid.uuid4().hex[:8]}",
        system_message="""You are a fitness expert for busy working moms. Create short, effective workout routines (15-20 minutes).
Return ONLY valid JSON in this format:
{
    "name": "Workout name",
    "duration": "15-20 min",
    "exercises": [
        {"name": "Exercise 1", "duration": "30 sec", "reps": "10"},
        {"name": "Exercise 2", "duration": "1 min", "reps": null},
        ...
    ]
}
Include warm-up and cool-down. No equipment needed."""
    ).with_model("openai", "gpt-5.2")
    
    prompt = f"""Create a short workout routine for a busy working mom.
Focus area: {body.get('focus', 'full body')}
Fitness level: {body.get('fitness_level', 'beginner')}
Available time: {body.get('duration', '15-20 minutes')}
Goals: {body.get('goals', 'energy, strength, flexibility')}"""
    
    user_message = UserMessage(text=prompt)
    
    try:
        response = await chat.send_message(user_message)
        import json
        
        try:
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0]
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0]
            else:
                json_str = response
            
            workout_data = json.loads(json_str.strip())
        except:
            raise HTTPException(status_code=500, detail="Failed to parse AI response")
        
        workout_data["id"] = f"work_{uuid.uuid4().hex[:8]}"
        
        await db.selfcare.update_one(
            {"user_id": current_user.user_id},
            {"$push": {"workout_routines": workout_data}},
            upsert=True
        )
        
        return workout_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI processing error: {str(e)}")

@app.delete("/api/selfcare/workout/{workout_id}")
async def delete_workout(workout_id: str, current_user: User = Depends(require_auth)):
    """Delete a workout routine"""
    result = await db.selfcare.update_one(
        {"user_id": current_user.user_id},
        {"$pull": {"workout_routines": {"id": workout_id}}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Workout not found")
    return {"message": "Workout deleted"}

# ============== AI Chat Endpoint ==============

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    language: str = "ro"
    history: List[ChatMessage] = []

@app.post("/api/ai/chat")
async def ai_chat(request: Request):
    """Empathetic AI chat for moms"""
    body = await request.json()
    message = body.get("message", "")
    language = body.get("language", "ro")
    history = body.get("history", [])
    
    if not message:
        raise HTTPException(status_code=400, detail="Message is required")
    
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="AI service not configured")
    
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    # Language-specific system messages
    system_messages = {
        "ro": """Ești Mom Assistant - o prietenă empatică și înțelegătoare pentru mamele care lucrează.

REGULI FOARTE IMPORTANTE:
- Fii mereu caldă, înțelegătoare și suportivă
- Nu judeca NICIODATĂ o mamă pentru deciziile ei
- Nu critica, nu jigni, nu folosi un ton negativ NICIODATĂ
- Oferă sfaturi practice și realizabile
- Validează sentimentele mamei întotdeauna
- Folosește un limbaj prietenos și încurajator
- Adaugă emoji-uri pentru a fi mai prietenoasă
- Răspunde concis dar cu empatie
- Dacă mama pare obosită sau copleșită, oferă cuvinte de încurajare
- Reamintește-i că este o mamă minunată care face tot posibilul

Ești aici să ajuți cu: organizare, meal planning, activități copii, self-care, sfaturi practice pentru mame.""",
        
        "en": """You are Mom Assistant - an empathetic and understanding friend for working mothers.

VERY IMPORTANT RULES:
- Always be warm, understanding and supportive
- NEVER judge a mother for her decisions
- NEVER criticize, insult, or use a negative tone
- Offer practical and achievable advice
- Always validate the mother's feelings
- Use friendly and encouraging language
- Add emojis to be more friendly
- Respond concisely but with empathy
- If the mom seems tired or overwhelmed, offer words of encouragement
- Remind her that she is an amazing mom doing her best

You're here to help with: organization, meal planning, kids activities, self-care, practical tips for moms.""",
    }
    
    lang_code = language.split("-")[0] if "-" in language else language
    system_message = system_messages.get(lang_code, system_messages["en"])
    
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"chat_{uuid.uuid4().hex[:8]}",
        system_message=system_message
    ).with_model("openai", "gpt-5.2")
    
    # Build context from history
    context = ""
    if history:
        context = "Conversație anterioară:\n"
        for msg in history[-5:]:  # Last 5 messages for context
            role = "Mama" if msg.get("role") == "user" else "Tu"
            context += f"{role}: {msg.get('content', '')}\n"
        context += "\n"
    
    prompt = f"{context}Mama spune acum: {message}"
    
    user_message = UserMessage(text=prompt)
    
    try:
        response = await chat.send_message(user_message)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI chat error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
