import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * Color theme for override, matching provided palette.
 */
const COLORS = {
  primary: "#4CAF50", // Green (Goals/Progress/Primary)
  secondary: "#FFC107", // Orange-Yellow (Accent)
  accent: "#2196F3", // Blue (Buttons/Milestones)
  background: "#fafbfc",
  card: "#fff",
  textPrimary: "#212121",
  textSecondary: "#555",
  progressBg: "#e0e6e8",
  border: "#f0f0f0",
};

// PUBLIC_INTERFACE
function App() {
  // State: list of goals and reminders
  const [goals, setGoals] = useState([]);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [nextReminderMsg, setNextReminderMsg] = useState("");
  const [activeGoalId, setActiveGoalId] = useState(null);

  // Add a new goal
  // PUBLIC_INTERFACE
  function handleAddGoal(goal) {
    setGoals([
      ...goals,
      {
        ...goal,
        id: Date.now().toString(),
        contributed: 0,
        contributions: [],
      },
    ]);
    setShowAddGoal(false);
  }

  // Delete a goal
  // PUBLIC_INTERFACE
  function handleDeleteGoal(goalId) {
    setGoals(goals.filter((g) => g.id !== goalId));
    if (activeGoalId === goalId) setActiveGoalId(null);
  }

  // Mark a goal as active
  // PUBLIC_INTERFACE
  function handleActivateGoal(goalId) {
    setActiveGoalId(goalId);
  }

  // Smart Contribution Calculation based on income and habits
  // PUBLIC_INTERFACE
  function computeSmartContribution(goal, userIncome, monthSpending) {
    // Minimum: Evenly divide remaining amount by months left
    // Add: If user has saved more in the past, suggest higher flex amount
    const now = new Date();
    const deadline = new Date(goal.deadline);
    const months =
      (deadline.getFullYear() - now.getFullYear()) * 12 +
      (deadline.getMonth() - now.getMonth()) +
      (deadline.getDate() >= now.getDate() ? 0 : -1);

    let monthsLeft = Math.max(months, 1);
    let minMonthly = Math.ceil((goal.amount - goal.contributed) / monthsLeft);

    // If the user estimates a surplus, suggest optional increase
    let suggested = minMonthly;
    if (userIncome && monthSpending) {
      const surplus = userIncome - monthSpending;
      if (surplus > minMonthly) {
        suggested = Math.round(minMonthly + (surplus - minMonthly) * 0.4);
      }
    }
    return Math.max(suggested, 1);
  }

  // Make a contribution
  // PUBLIC_INTERFACE
  function handleContribute(goalId, amount) {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              contributed: parseFloat(goal.contributed) + parseFloat(amount),
              contributions: [
                ...goal.contributions,
                { amount: parseFloat(amount), date: new Date().toISOString() },
              ],
            }
          : goal
      )
    );
  }

  // Create auto reminders (simple local notifications)
  useEffect(() => {
    if (!goals.length) return;
    // Only for active goal or all
    const remindersArr = [];
    const now = new Date();
    for (let goal of goals) {
      const isComplete = goal.contributed >= goal.amount;
      if (isComplete) continue;

      // Reminder msg (different for micro/milestone overdue)
      const deadline = new Date(goal.deadline);
      const msLeft =
        deadline.getTime() - now.getTime();
      const daysLeft = Math.max(Math.ceil(msLeft / (1000 * 60 * 60 * 24)), 0);
      if (daysLeft <= 30 && !isComplete) {
        remindersArr.push(
          `Goal "${goal.title}" is only ${daysLeft} day${daysLeft === 1 ? "" : "s"} away!`
        );
      } else if (daysLeft % 7 === 0 || daysLeft === 1) {
        remindersArr.push(
          `Weekly check-in: Save for "${goal.title}" to stay on track!`
        );
      }
      // Micro-savings encouragement for all incomplete goals
      if (!isComplete && goal.amount - goal.contributed > 0) {
        remindersArr.push(
          `Tip: Try saving a small amount towards "${goal.title}" today!`
        );
      }
    }
    setReminders(remindersArr);
    setNextReminderMsg(remindersArr[0] || "");
  }, [goals]);

  // UI for main (Goals, progress, add, reminders)
  return (
    <div
      className="app"
      style={{
        background: COLORS.background,
        color: COLORS.textPrimary,
        minHeight: "100vh",
      }}
    >
      <nav
        className="navbar"
        style={{
          background: COLORS.primary,
          borderBottom: `2px solid ${COLORS.border}`,
          color: "#fff",
        }}
      >
        <div className="container" style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              alignItems: "center",
            }}
          >
            <div className="logo" style={{ color: "#fff" }}>
              <span
                className="logo-symbol"
                style={{ color: COLORS.accent, marginRight: 8 }}
              >
                💡
              </span>
              FinanceGoals Tracker
            </div>
            <button
              className="btn"
              style={{
                backgroundColor: COLORS.accent,
                color: "#fff",
                fontWeight: 500,
              }}
              onClick={() => setShowAddGoal(true)}
            >
              + Add Goal
            </button>
          </div>
        </div>
      </nav>

      <main>
        <div
          className="container"
          style={{ marginTop: 100, marginBottom: 50, maxWidth: 900 }}
        >
          <div
            className="hero"
            style={{
              padding: "0",
              flexDirection: "column",
              alignItems: "stretch",
              gap: 32,
            }}
          >
            <div style={{ marginBottom: 24 }}>
              <h1
                className="title"
                style={{
                  color: COLORS.primary,
                  fontSize: "2.2rem",
                  margin: "20px 0 0 0",
                  textAlign: "center",
                  fontWeight: 700,
                }}
              >
                Track, Plan, and Achieve Your Savings Goals
              </h1>
              <p
                className="description"
                style={{ textAlign: "center", color: COLORS.textSecondary }}
              >
                Plan and monitor your financial goals—no bank connection needed. Build better savings habits and track your progress visually.
              </p>
            </div>
            {reminders.length > 0 && (
              <div
                style={{
                  background: COLORS.accent,
                  color: "#fff",
                  borderRadius: 6,
                  padding: "12px 18px",
                  margin: "0 auto 16px auto",
                  maxWidth: 470,
                  fontWeight: 500,
                  fontSize: "1.02rem",
                  boxShadow: "0 2px 12px 0 rgba(33,150,243,0.06)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
                role="alert"
                aria-live="polite"
              >
                <span style={{ fontSize: 20 }}>⏰</span>
                {nextReminderMsg}
              </div>
            )}

            <MultipleGoalsManager
              goals={goals}
              onActivate={handleActivateGoal}
              onDelete={handleDeleteGoal}
              activeGoalId={activeGoalId}
            />

            {activeGoalId ? (
              <GoalPlannerCard
                key={activeGoalId}
                goal={goals.find((g) => g.id === activeGoalId)}
                onContribute={handleContribute}
                computeSmartContribution={(goal, income, spending) =>
                  computeSmartContribution(goal, income, spending)
                }
                colors={COLORS}
              />
            ) : goals.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  margin: "50px auto 0 auto",
                  color: COLORS.secondary,
                  fontWeight: 500,
                }}
              >
                No goals yet.
                <br />
                Click <b>+ Add Goal</b> to get started!
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  margin: "50px auto 0 auto",
                  color: COLORS.secondary,
                }}
              >
                Select a goal to view or update details.
              </div>
            )}
            {showAddGoal && (
              <GoalForm
                onAdd={handleAddGoal}
                onClose={() => setShowAddGoal(false)}
                colors={COLORS}
              />
            )}
          </div>
        </div>
        <footer
          style={{
            padding: "32px 0 16px 0",
            textAlign: "center",
            fontSize: "1rem",
            color: "#c2c2c2",
          }}
        >
          {/* Footer for minimalism */}
          <span style={{ color: COLORS.primary, fontWeight: 600 }}>
            FinanceGoals Tracker{" "}
          </span>
          © {new Date().getFullYear()} | No bank link required
        </footer>
      </main>
    </div>
  );
}

// PUBLIC_INTERFACE
function MultipleGoalsManager({ goals, onActivate, onDelete, activeGoalId }) {
  return (
    <div
      style={{
        marginBottom: 24,
        display: "flex",
        flexWrap: "wrap",
        gap: 18,
        justifyContent: "center",
      }}
    >
      {goals.map((goal) => (
        <div
          key={goal.id}
          style={{
            background: "#fff",
            minWidth: 240,
            maxWidth: 300,
            borderRadius: 8,
            border:
              goal.id === activeGoalId
                ? "2px solid #2196F3"
                : "1px solid #d6e0e9",
            boxShadow: "0 2px 8px 0 rgba(44,62,80,0.04)",
            padding: 16,
            transition: "border 0.22s",
            position: "relative",
            cursor: "pointer",
          }}
          onClick={() => onActivate(goal.id)}
          tabIndex={0}
          aria-label={`Goal: ${goal.title}`}
        >
          <div
            style={{
              fontWeight: 600,
              fontSize: "1.07rem",
              color: "#222",
              marginBottom: 6,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>
              {goal.title}
              {goal.id === activeGoalId && (
                <span style={{ color: "#2196F3" }}> ★</span>
              )}
            </span>
            <span
              title="Delete Goal"
              style={{
                color: "#e74c3c",
                fontWeight: "normal",
                marginLeft: 8,
                cursor: "pointer",
                fontSize: 18,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(goal.id);
              }}
            >
              ×
            </span>
          </div>
          <div
            style={{
              fontSize: "0.97rem",
              color: "#676767",
              marginBottom: 4,
            }}
          >
            Target: <b>₹{goal.amount}</b>
          </div>
          <GoalProgressBar contributed={goal.contributed} target={goal.amount} />
        </div>
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
function GoalProgressBar({ contributed, target }) {
  const pct = Math.min(100, ((contributed || 0) / (target || 1)) * 100);
  let milestone = "In Progress";
  if (pct >= 100) milestone = "Goal Achieved! 🏆";
  else if (pct >= 90) milestone = "Almost Done!";
  else if (pct >= 50) milestone = "Halfway!";

  return (
    <div style={{ margin: "10px 0" }}>
      <div
        style={{
          background: "#e0e6e8",
          height: 14,
          borderRadius: 20,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            background: "#4CAF50",
            height: 14,
            borderRadius: 20,
            transition: "width 0.4s",
          }}
        ></div>
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: "0.93rem",
          display: "flex",
          justifyContent: "space-between",
          color: "#5e6b6b",
        }}
      >
        <span>
          ₹{contributed} / ₹{target}
        </span>
        <span style={{ color: "#2196F3", fontSize: "0.94rem" }}>{milestone}</span>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function GoalPlannerCard({
  goal,
  onContribute,
  computeSmartContribution,
  colors,
}) {
  // Simulate a simple income/spending model for the user
  const [income, setIncome] = useState("");
  const [spending, setSpending] = useState("");
  const [contrib, setContrib] = useState("");
  const smartContrib = computeSmartContribution(
    goal,
    Number(income),
    Number(spending)
  );

  const completed = goal.contributed >= goal.amount;
  // PUBLIC_INTERFACE
  function handleContribute() {
    const amt = parseFloat(contrib || smartContrib);
    if (!amt || amt <= 0) return;
    onContribute(goal.id, amt);
    setContrib("");
  }

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 10,
        boxShadow: "0 3px 14px 0 rgba(44,62,80,0.06)",
        maxWidth: 530,
        margin: "0 auto",
        padding: 24,
        marginTop: 24,
      }}
      aria-label={`Goal Planner: ${goal.title}`}
    >
      <h2
        style={{
          margin: "0 0 8px 0",
          color: colors.primary,
          fontWeight: 700,
          fontSize: "1.4rem",
        }}
      >
        {goal.title}
      </h2>
      <div style={{ color: colors.textSecondary, fontSize: "1rem" }}>
        Deadline:{" "}
        <b>
          {new Date(goal.deadline).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </b>
        <br />
        Target: <b>₹{goal.amount}</b>
      </div>
      <GoalProgressBar contributed={goal.contributed} target={goal.amount} />

      {!completed && (
        <form
          style={{
            marginTop: 20,
            marginBottom: 12,
            background: "#f6faf6",
            borderRadius: 7,
            padding: 16,
            border: `1.5px solid #e3e3ef`,
          }}
          onSubmit={(e) => {
            e.preventDefault();
            handleContribute();
          }}
        >
          <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
            <div>
              <label>
                <span style={{ color: "#777", fontSize: 14 }}>
                  Monthly Income
                </span>
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  style={inputStyle}
                  placeholder="e.g. 50000"
                />
              </label>
            </div>
            <div>
              <label>
                <span style={{ color: "#777", fontSize: 14 }}>
                  Avg. Monthly Spending
                </span>
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={spending}
                  onChange={(e) => setSpending(e.target.value)}
                  style={inputStyle}
                  placeholder="e.g. 35000"
                />
              </label>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input
              type="number"
              min="1"
              inputMode="numeric"
              value={contrib}
              onChange={(e) => setContrib(e.target.value)}
              style={{ ...inputStyle, flex: 1, minWidth: 60 }}
              placeholder={smartContrib ? `Suggest: ₹${smartContrib}` : "Amount"}
            />
            <button
              type="submit"
              className="btn"
              style={{
                background: colors.primary,
                color: "#fff",
                minWidth: 80,
                fontWeight: 600,
                borderRadius: 5,
              }}
            >
              Save
            </button>
            <span
              style={{
                fontSize: 13,
                color: "#5e7377",
                marginLeft: 6,
              }}
              aria-label="smart suggestion"
              title={`Suggested: ₹${smartContrib} per month`}
            >
              💡 <b>₹{smartContrib}</b> / mo
            </span>
          </div>
        </form>
      )}
      {completed && (
        <div
          style={{
            padding: "12px 0 2px 0",
            fontWeight: 600,
            color: "#4CAF50",
            fontSize: "1.1rem",
            textAlign: "center",
          }}
        >
          🎉 Congratulations! This goal is complete!
        </div>
      )}

      <div
        style={{
          margin: "20px 0 8px 0",
          fontSize: "1.02rem",
          fontWeight: 500,
          color: "#2196F3",
        }}
      >
        Contributions Log:
      </div>
      {goal.contributions && goal.contributions.length > 0 ? (
        <ul style={{ paddingLeft: 0, fontSize: "0.96rem" }}>
          {[...goal.contributions]
            .reverse()
            .slice(0, 7)
            .map((c, idx) => (
              <li
                style={{
                  listStyle: "none",
                  marginBottom: 3,
                  fontSize: 15,
                  color: "#444",
                  borderBottom: "1px dashed #e7e7ff",
                  paddingBottom: 2,
                }}
                key={idx}
              >
                {new Date(c.date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "2-digit",
                })}{" "}
                - <span style={{ color: "#4CAF50" }}>₹{c.amount}</span>
              </li>
            ))}
        </ul>
      ) : (
        <div style={{ color: "#aaa", fontSize: 14 }}>No contributions yet.</div>
      )}
    </div>
  );
}

const inputStyle = {
  border: "1.5px solid #cbe0ec",
  borderRadius: 5,
  padding: "7px 9px",
  fontSize: 16,
  outline: "none",
  background: "#fff",
  color: "#222",
  marginTop: 2,
  marginRight: 2,
  width: "110px",
};

/**
 * Goal Form for adding a new goal
 */
// PUBLIC_INTERFACE
function GoalForm({ onAdd, onClose, colors }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [err, setErr] = useState("");
  // PUBLIC_INTERFACE
  function handleSubmit(e) {
    e.preventDefault();
    let numAmount = parseFloat(amount);
    if (!title || !amount || !deadline || isNaN(numAmount) || numAmount <= 0) {
      setErr("Please fill all fields with valid values.");
      return;
    }
    // Deadline cannot be before today
    if (new Date(deadline) < new Date(new Date().toDateString())) {
      setErr("Deadline must be a future date.");
      return;
    }
    // PUBLIC_INTERFACE
    onAdd({
      title: title.trim(),
      amount: numAmount,
      deadline,
    });
    setTitle("");
    setAmount("");
    setDeadline("");
    setErr("");
  }

  return (
    <div
      aria-label="Add Goal Modal"
      tabIndex={0}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(60,60,92,0.11)",
        zIndex: 1000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          padding: "26px 24px 18px 24px",
          borderRadius: 10,
          minWidth: 285,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          boxShadow: "0 2px 22px 0 rgba(33,33,55,0.15)",
          maxWidth: 350,
        }}
      >
        <div
          style={{ fontWeight: "bold", color: colors.primary, fontSize: "1.2rem" }}
        >
          Add a New Goal
        </div>
        <label>
          <span style={{ color: "#5a6c7d", fontSize: 14 }}>Title</span>
          <input
            type="text"
            maxLength={28}
            style={inputStyle}
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Buy a laptop"
            required
          />
        </label>
        <label>
          <span style={{ color: "#5a6c7d", fontSize: 14 }}>Target Amount (₹)</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            style={inputStyle}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 50000"
            required
          />
        </label>
        <label>
          <span style={{ color: "#5a6c7d", fontSize: 14 }}>Deadline</span>
          <input
            type="date"
            style={inputStyle}
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </label>
        {err && (
          <div style={{ color: "#e74c3c", fontSize: 14, minHeight: 16 }}>{err}</div>
        )}
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button
            type="submit"
            className="btn"
            style={{
              backgroundColor: colors.primary,
              color: "#fff",
              flex: 1,
            }}
          >
            Add
          </button>
          <button
            type="button"
            className="btn"
            style={{
              backgroundColor: "#dbdbdb",
              color: "#333",
              flex: 1,
            }}
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;
