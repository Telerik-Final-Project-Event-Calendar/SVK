import React, { useContext } from "react";
import { AppContext } from "../state/app.context";
import { Navigate } from "react-router-dom";

interface AdminOnlyProps {
  children: React.ReactNode;
}

export default function AdminOnly({ children }: AdminOnlyProps) {
  const { userData, isLoading } = useContext(AppContext);

  if (isLoading) return <div>Loading...</div>;

  if (!userData?.isAdmin) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <>{children}</>;
}
