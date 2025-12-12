"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye, EyeOff } from "lucide-react";
import { profileUpdateSchema, ProfileFormValues } from "@/schemas/profileFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Image from "next/image";
import axios from "axios";

export default function AdminProfile() {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const [adminData, setAdminData] = useState({
    name: "",
    email: "",
    avatar: ""
  });
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileUpdateSchema),
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/admin/profile');
        setAdminData(response.data.data);
        setValue('name', response.data.data.name);
        setValue('email', response.data.data.email);
        if (response.data.data.avatar) {
          setAvatarPreview(response.data.data.avatar);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) fetchProfile();
  }, [session, setValue]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      // Handle avatar upload separately if a new file was selected
      if (data.avatar instanceof File) {
        const formData = new FormData();
        formData.append('avatar', data.avatar);
        await axios.post('/api/admin/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      // Update profile data
      const updateResponse = await axios.put('/api/admin/profile', {
        name: data.name,
        email: data.email,
        ...(data.password && { password: data.password }),
      });

      // Refresh profile data
      setAdminData(updateResponse.data.data);
      setIsModalOpen(false);
      reset();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setValue("avatar", file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  if (isLoading) return <div className="flex justify-center mt-8">Loading...</div>;

  return (
    <div className="flex flex-col items-center min-h-screen p-6 bg-gray-100">
      {/* Profile Heading */}
      <div className="w-full max-w-lg pb-6 border-b border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 text-center">Admin Profile</h2>
        <p className="text-gray-500 text-center">Manage your profile details</p>
      </div>

      {/* Avatar Section */}
      <div className="w-full max-w-lg mt-6 flex flex-col items-center">
        {avatarPreview ? (
          <Image 
            src={avatarPreview} 
            alt="Admin Avatar" 
            className="w-24 h-24 rounded-full"
            width={96}
            height={96}
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            {adminData.name.charAt(0)}
          </div>
        )}
      </div>

      {/* Input Fields for Profile Details */}
      <div className="w-full max-w-lg mt-6 space-y-4">
        {/* Full Name */}
        <div>
          <label className="text-sm font-medium text-gray-700">Full Name</label>
          <Input disabled value={adminData.name} className="border border-gray-300 bg-gray-200" />
        </div>

        {/* Email */}
        <div>
          <label className="text-sm font-medium text-gray-700">Email Address</label>
          <Input disabled value={adminData.email} className="border border-gray-300 bg-gray-200" />
        </div>

        {/* Password (Masked) */}
        <div>
          <label className="text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <Input 
              disabled 
              type={showCurrentPassword ? "text" : "password"} 
              value="********" 
              className="border border-gray-300 bg-gray-200 pr-10" 
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              disabled={isSubmitting}
            >
              {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Update Button */}
      <div className="flex justify-center mt-6">
        <Button 
          variant="default" 
          className="py-2 text-lg font-medium" 
          onClick={() => setIsModalOpen(true)}
          disabled={isSubmitting}
        >
          Update Profile
        </Button>
      </div>

      {/* Update Profile Modal */}
      <Dialog open={isModalOpen} onOpenChange={() => setIsModalOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <Input 
                {...register("name")} 
                className="border border-gray-300" 
                defaultValue={adminData.name}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <Input 
                {...register("email")} 
                className="border border-gray-300" 
                defaultValue={adminData.email}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  {...register("password")} 
                  placeholder="Leave blank to keep current"
                  className="border border-gray-300 pr-10" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>

            {/* Avatar Upload */}
            <div>
              <label className="text-sm font-medium text-gray-700">Profile Picture</label>
              <Input 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarChange} 
                className="border border-gray-300" 
              />
              {errors.avatar && <p className="text-red-500 text-sm">{errors.avatar.message}</p>}
            </div>

            {/* Dialog Footer */}
            <DialogFooter className="mt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                variant="default" 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}