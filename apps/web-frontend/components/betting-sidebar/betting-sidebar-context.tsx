import React, { createContext, useContext, useReducer, useCallback } from "react";

// State Machine States
export type BettingState = 
  | "idle"
  | "approving" 
  | "signing"
  | "placing"
  | "success"
  | "error";

// State Machine Events  
export type BettingEvent = 
  | { type: "START_BET" }
  | { type: "APPROVE_START" }
  | { type: "APPROVE_SUCCESS" }
  | { type: "APPROVE_ERROR"; error: string }
  | { type: "SIGN_START" }
  | { type: "SIGN_SUCCESS" }
  | { type: "SIGN_ERROR"; error: string }
  | { type: "PLACE_START" }
  | { type: "PLACE_SUCCESS"; transactionHash: string }
  | { type: "PLACE_ERROR"; error: string }
  | { type: "RESET" };

// State Machine Context
interface BettingMachineState {
  state: BettingState;
  transactionHash: string | null;
  error: string | null;
}

// State Machine Transitions
const transitions: Record<BettingState, Partial<Record<BettingEvent["type"], BettingState>>> = {
  idle: {
    START_BET: "approving",
    RESET: "idle",
  },
  approving: {
    APPROVE_SUCCESS: "signing",
    APPROVE_ERROR: "error",
    RESET: "idle",
  },
  signing: {
    SIGN_SUCCESS: "placing", 
    SIGN_ERROR: "error",
    RESET: "idle",
  },
  placing: {
    PLACE_SUCCESS: "success",
    PLACE_ERROR: "error", 
    RESET: "idle",
  },
  success: {
    RESET: "idle",
  },
  error: {
    START_BET: "approving", // Allow retry from error
    RESET: "idle",
  },
};

// State Machine Reducer
function bettingMachineReducer(
  state: BettingMachineState,
  event: BettingEvent
): BettingMachineState {
  const currentState = state.state;
  const nextState = transitions[currentState][event.type];
  
  if (!nextState) {
    // Invalid transition - just return current state
    console.warn(`Invalid transition: ${currentState} -> ${event.type}`);
    return state;
  }

  console.log(`State transition: ${currentState} -> ${nextState} (${event.type})`);

  // Early return for PLACE_ERROR to ensure we actually transition
  if (event.type === "PLACE_ERROR") {
    console.log("Handling PLACE_ERROR transition with error:", "error" in event ? event.error : "unknown error");
  }

  // Handle state-specific logic
  switch (event.type) {
    case "PLACE_SUCCESS":
      return {
        state: nextState,
        transactionHash: event.transactionHash,
        error: null,
      };
    case "APPROVE_ERROR":
    case "SIGN_ERROR":
    case "PLACE_ERROR":
      return {
        state: nextState,
        transactionHash: null,
        error: event.error,
      };
    case "RESET":
      return {
        state: nextState,
        transactionHash: null,
        error: null,
      };
    default:
      return {
        state: nextState,
        transactionHash: state.transactionHash,
        error: state.error,
      };
  }
}

// Context
interface BettingMachineContextValue {
  state: BettingMachineState;
  dispatch: React.Dispatch<BettingEvent>;
  // Helper methods
  canTransition: (eventType: BettingEvent["type"]) => boolean;
  isIdle: () => boolean;
  isApproving: () => boolean;
  isSigning: () => boolean;
  isPlacing: () => boolean;
  isSuccess: () => boolean;
  isError: () => boolean;
  isProcessing: () => boolean;
  reset: () => void;
}

const BettingMachineContext = createContext<BettingMachineContextValue | undefined>(undefined);

// Provider
export const BettingSidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(bettingMachineReducer, {
    state: "idle",
    transactionHash: null,
    error: null,
  });

  const canTransition = useCallback((eventType: BettingEvent["type"]) => {
    return Boolean(transitions[state.state][eventType]);
  }, [state.state]);

  const isIdle = useCallback(() => state.state === "idle", [state.state]);
  const isApproving = useCallback(() => state.state === "approving", [state.state]);
  const isSigning = useCallback(() => state.state === "signing", [state.state]);
  const isPlacing = useCallback(() => state.state === "placing", [state.state]);
  const isSuccess = useCallback(() => state.state === "success", [state.state]);
  const isError = useCallback(() => state.state === "error", [state.state]);
  const isProcessing = useCallback(() => {
    return state.state === "approving" || state.state === "signing" || state.state === "placing";
  }, [state.state]);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const value: BettingMachineContextValue = {
    state,
    dispatch,
    canTransition,
    isIdle,
    isApproving,
    isSigning,
    isPlacing,
    isSuccess,
    isError,
    isProcessing,
    reset,
  };

  return (
    <BettingMachineContext.Provider value={value}>
      {children}
    </BettingMachineContext.Provider>
  );
};

// Hook
export function useBettingSidebar() {
  const context = useContext(BettingMachineContext);
  if (!context) {
    throw new Error("useBettingSidebar must be used within a BettingSidebarProvider");
  }
  return context;
}

// Legacy compatibility - keep the old ViewState type for now
export type ViewState = "betting" | "approving" | "signing" | "placing" | "success"; 