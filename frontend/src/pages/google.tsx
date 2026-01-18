import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { notification, Spin } from "antd";
import { useAppDispatch } from "../app/hooks";
import { apiSlice } from "../features/api/apiSlice";
import { setUser } from "../features/auth/authSlice";

export default function Google() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const hasRunInitialAuthCheck = useRef(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    if (hasRunInitialAuthCheck.current) return;
    hasRunInitialAuthCheck.current = true;

    async function processOAuthToken() {
      const params = new URLSearchParams(window.location.search);
      const error = params.get("error");

      // Check for error first
      if (error) {
        notification.error({
          message: "OAuth Error",
          description: `Authentication failed: ${error}`,
          placement: "topRight",
          duration: 5,
        });
        setIsLoadingAuth(false);
        navigate("/login", { replace: true });
        return;
      }

      try {
        // Give a small delay to ensure cookies are set
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Check auth with retry mechanism
        let authSuccess = false;
        let userData = null;
        let retryCount = 0;
        const maxRetries = 3;

        while (!authSuccess && retryCount < maxRetries) {
          try {
            // Use initiate for manual dispatch
            userData = await dispatch(
              apiSlice.endpoints.checkAuth.initiate(undefined, {
                forceRefetch: true,
              })
            ).unwrap();

            if (userData) {
              authSuccess = true;
            }
          } catch (checkAuthError) {
            retryCount++;
            console.warn(
              `Auth check attempt ${retryCount} failed:`,
              checkAuthError
            );

            if (retryCount < maxRetries) {
              // Wait before retry
              await new Promise((resolve) =>
                setTimeout(resolve, 500 * retryCount)
              );
            }
          }
        }

        if (authSuccess && userData) {
          // Explicitly update Redux state
          dispatch(setUser(userData));

          notification.success({
            message: "Login Successful",
            description: "You have been logged in with Google",
            placement: "topRight",
            duration: 2,
          });

          // Navigate immediately
          navigate("/", { replace: true });
        } else {
          throw new Error(
            "Authentication verification failed after multiple attempts"
          );
        }
      } catch (error) {
        console.error("OAuth login error:", error);
        notification.error({
          message: "Login Failed",
          description: "Authentication failed. Please try again.",
          placement: "topRight",
          duration: 3,
        });
        navigate("/login", { replace: true });
      } finally {
        setIsLoadingAuth(false);
      }
    }

    processOAuthToken();
  }, [dispatch, navigate]);

  return (
    <div className="flex flex-col items-center justify-center mt-20 text-gray-500">
      {isLoadingAuth ? (
        <>
          <Spin size="large" />
          <p className="mt-4">Processing Google login...</p>
        </>
      ) : null}
    </div>
  );
}
