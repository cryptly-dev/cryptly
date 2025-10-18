import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PersonalInvitesSection } from "@/components/me/PersonalInvitesSection";
import { authLogic } from "@/lib/logics/authLogic";
import { useNavigate } from "@tanstack/react-router";
import { useAsyncActions, useValues } from "kea";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { UserApi } from "@/lib/api/user.api";
import { Pencil, Check, X } from "lucide-react";

export function MePage() {
  const navigate = useNavigate();
  const { userData, isLoggedIn, jwtToken } = useValues(authLogic);
  const { loadUserData } = useAsyncActions(authLogic);
  const { logout } = useAuth();
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate({ to: "/app/login" });
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (userData?.displayName) {
      setDisplayNameInput(userData.displayName);
    }
  }, [userData?.displayName]);

  const handleSaveDisplayName = async () => {
    if (!jwtToken) return;

    setIsSaving(true);
    try {
      await UserApi.updateMe(jwtToken, { displayName: displayNameInput });
      await loadUserData();
    } catch (error) {
      console.error("Failed to update display name:", error);
    } finally {
      setIsSaving(false);
      setIsEditingDisplayName(false);
    }
  };

  const handleCancelEdit = () => {
    setDisplayNameInput(userData?.displayName ?? "");
    setIsEditingDisplayName(false);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 1, ease: [0, 1, 0, 1] },
    },
  } as const;

  if (!userData) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          className="bg-card rounded-xl shadow-lg border border-border p-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-2 bg-muted rounded-full text-muted-foreground">
                <img
                  src={userData?.avatarUrl}
                  alt="User Avatar"
                  className="w-16 h-16 rounded-full"
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-card-foreground mb-2">
              Your Profile
            </h1>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <label className="text-sm font-medium text-muted-foreground block mb-2">
                  Display Name
                </label>
                {isEditingDisplayName ? (
                  <div className="flex gap-2 items-center h-[34px]">
                    <Input
                      value={displayNameInput}
                      onChange={(e) => setDisplayNameInput(e.target.value)}
                      placeholder="Enter display name"
                      className="flex-1 h-[34px] text-lg"
                      maxLength={200}
                      disabled={isSaving}
                    />
                    <Button
                      key={"confirm"}
                      variant="default"
                      size="sm"
                      onClick={handleSaveDisplayName}
                      isLoading={isSaving}
                      className="h-[34px] w-[34px] p-0 cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      key={"cancel"}
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="h-[34px] w-[34px] p-0 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between h-[34px]">
                    <p className="text-lg font-medium text-card-foreground">
                      {userData.displayName}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingDisplayName(true)}
                      className="h-[34px] w-[34px] p-0 cursor-pointer"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <label className="text-sm font-medium text-muted-foreground">
                  Email Address
                </label>
                <p className="text-lg font-medium text-card-foreground mt-1">
                  {userData.email}
                </p>
              </div>
            </div>

            <PersonalInvitesSection />

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-card px-2 text-muted-foreground">
                  Actions
                </span>
              </div>
            </div>

            <Button
              onClick={logout}
              variant="secondary"
              size="lg"
              className="w-full cursor-pointer"
            >
              Log out
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
