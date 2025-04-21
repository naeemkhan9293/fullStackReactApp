import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { selectCurrentUser } from "@/store/slices/authSlice";
import { useUpdateProfileMutation } from "@/store/api/authApi";
import { uploadAvatar, selectUploadState } from "@/store/slices/uploadSlice";
import { toast } from "sonner";
import { Camera, Loader2, Upload } from "lucide-react";

const Profile = () => {
  // Get user data from Redux store
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectCurrentUser);
  const uploadState = useSelector(selectUploadState);
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize local state with user data or default values
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    bio: "",
    location: "",
    website: "",
    avatar: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(userData);

  // Update local state when user data changes
  useEffect(() => {
    if (user) {
      const updatedUserData = {
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        avatar: user.avatar || "",
      };
      setUserData(updatedUserData);
      setFormData(updatedUserData);
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle avatar file selection
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.match("image.*")) {
      toast.error("Please select an image file");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      // Dispatch the upload action
      const resultAction = await dispatch(uploadAvatar(file));

      if (uploadAvatar.fulfilled.match(resultAction)) {
        toast.success("Avatar updated successfully");
      } else if (uploadAvatar.rejected.match(resultAction)) {
        throw resultAction.payload || resultAction.error;
      }
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      toast.error("Failed to upload avatar. Please try again.");
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Only send fields that have changed
      const changedFields: Record<string, string> = {};
      Object.keys(formData).forEach((key) => {
        const typedKey = key as keyof typeof formData;
        if (formData[typedKey] !== userData[typedKey]) {
          changedFields[key] = formData[typedKey];
        }
      });

      if (Object.keys(changedFields).length === 0) {
        setIsEditing(false);
        return;
      }

      // Update profile via API
      await updateProfile(changedFields).unwrap();

      // Update local state
      setUserData(formData);
      setIsEditing(false);

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account settings and profile information
        </p>
        {!user && (
          <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-md">
            Loading user data... If this persists, please try logging in again.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your profile details and public information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFormData(userData);
                      setIsEditing(false);
                    }}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={userData.avatar} alt={userData.name} />
                      <AvatarFallback>
                        {userData.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                      onClick={triggerFileInput}
                      disabled={uploadState.isLoading}
                    >
                      {uploadState.isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{userData.name}</h3>
                    <p className="text-muted-foreground">{userData.email}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Bio
                  </h4>
                  <p>{userData.bio}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Location
                    </h4>
                    <p>{userData.location}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">
                      Website
                    </h4>
                    <p>{userData.website}</p>
                  </div>
                </div>
                <Button onClick={() => setIsEditing(true)} disabled={!user}>
                  Edit Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Notification Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Privacy Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="w-full">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
