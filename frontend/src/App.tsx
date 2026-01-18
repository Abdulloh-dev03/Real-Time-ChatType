import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import "@ant-design/v5-patch-for-react-19";
import Layout from "./layout/layout";
import Home from "./pages/home";
import Login from "./pages/login";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { useEffect, useMemo } from "react";
import { LoaderCircle } from "lucide-react";
import Profile from "./pages/profile";
import { setUser } from "./features/auth/authSlice";
import Google from "./pages/google";
import { useSocket } from "./hooks/useSocket";
import { useCheckAuthQuery } from "./features/api/apiSlice";
import VerifyPage from "./pages/verify";
import type { IUser } from "./types";

// Helper components for routing logic
const ProtectedRoute = ({
  children,
  authUser,
}: {
  children: React.ReactNode;
  authUser: IUser | null;
}) => {
  if (!authUser) return <Navigate to="/sign-in" replace />;
  if (!authUser.isVerified) return <Navigate to="/verify" replace />;
  return <>{children}</>;
};

const UnverifiedRoute = ({
  children,
  authUser,
}: {
  children: React.ReactNode;
  authUser: IUser | null;
}) => {
  if (!authUser) return <Navigate to="/sign-in" replace />;
  if (authUser.isVerified) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const PublicRoute = ({
  children,
  authUser,
}: {
  children: React.ReactNode;
  authUser: IUser | null;
}) => {
  if (authUser && authUser.isVerified) return <Navigate to="/" replace />;
  if (authUser && !authUser.isVerified)
    return <Navigate to="/verify" replace />;
  return <>{children}</>;
};

export default function App() {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);

  const { data: user, error, isLoading } = useCheckAuthQuery();

  useEffect(() => {
    if (user) {
      dispatch(setUser(user));
    } else if (error) {
      if ("status" in error && error.status === 403) {
        const errorData = error.data as { user?: IUser; code?: string };
        if (errorData?.code === "NOT_VERIFIED" && errorData?.user) {
          dispatch(setUser(errorData.user));
        }
      }
    }
  }, [user, error, dispatch]);

  useSocket();

  const router = useMemo(
    () =>
      createBrowserRouter([
        {
          path: "/",
          element: <Layout />,
          children: [
            {
              index: true,
              element: (
                <ProtectedRoute authUser={authUser}>
                  <Home />
                </ProtectedRoute>
              ),
            },
            {
              path: "/sign-up",
              element: (
                <PublicRoute authUser={authUser}>
                  <Login />
                </PublicRoute>
              ),
            },
            {
              path: "/sign-in",
              element: (
                <PublicRoute authUser={authUser}>
                  <Login />
                </PublicRoute>
              ),
            },
            {
              path: "/verify",
              element: (
                <UnverifiedRoute authUser={authUser}>
                  <VerifyPage />
                </UnverifiedRoute>
              ),
            },
            {
              path: "/profile",
              element: (
                <ProtectedRoute authUser={authUser}>
                  <Profile />
                </ProtectedRoute>
              ),
            },
            {
              path: "/oauth/callback",
              element: <Google />,
            },
            {
              path: "*",
              element: <Navigate to="/" replace />,
            },
          ],
        },
      ]),
    [authUser],
  );

  if (isLoading) {
    return (
      <div className="w-full h-screen flex justify-center bg-zinc-900 text-white items-center">
        <LoaderCircle className="size-10 animate-spin" />
      </div>
    );
  }

  return <RouterProvider router={router} />;
}
