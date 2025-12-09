import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Lock } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const forgotPasswordSchema = z.object({
    email: z.string().email(),
});

const verifyOtpSchema = z.object({
    code: z.string().min(6, "Code must be 6 digits"),
});

const resetPasswordSchema = z.object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

interface ChangePasswordDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userEmail: string;
}

export function ChangePasswordDialog({ open, onOpenChange, userEmail }: ChangePasswordDialogProps) {
    const [step, setStep] = useState<"request" | "verify" | "reset">("request");
    const [verifiedCode, setVerifiedCode] = useState<string>("");
    const { toast } = useToast();

    const requestForm = useForm({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: userEmail },
    });

    const verifyForm = useForm({
        resolver: zodResolver(verifyOtpSchema),
        defaultValues: { code: "" },
    });

    const resetForm = useForm({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    });

    const requestOtpMutation = useMutation({
        mutationFn: async (data: { email: string }) => {
            const res = await apiRequest("POST", "/api/auth/forgot-password", data);
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "Code Sent",
                description: "Please check the terminal for your verification code.",
            });
            setStep("verify");
        },
        onError: (error: Error) => {
            toast({
                title: "Failed to send code",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const verifyOtpMutation = useMutation({
        mutationFn: async (data: { email: string; code: string }) => {
            const res = await apiRequest("POST", "/api/auth/verify-otp", data);
            return res.json();
        },
        onSuccess: (data, variables) => {
            setVerifiedCode(variables.code);
            setStep("reset");
            toast({
                title: "Verified",
                description: "Code verified. Please enter your new password.",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Verification Failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const resetPasswordMutation = useMutation({
        mutationFn: async (data: z.infer<typeof resetPasswordSchema>) => {
            const payload = {
                email: userEmail,
                code: verifiedCode,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword,
            };
            const res = await apiRequest("POST", "/api/auth/reset-password", payload);
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Password changed successfully. Please log in again.",
            });
            onOpenChange(false);
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        },
        onError: (error: Error) => {
            toast({
                title: "Failed to reset password",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const onRequestSubmit = () => {
        requestOtpMutation.mutate({ email: userEmail });
    };

    const onVerifySubmit = (data: z.infer<typeof verifyOtpSchema>) => {
        verifyOtpMutation.mutate({ email: userEmail, code: data.code });
    };

    const onResetSubmit = (data: z.infer<typeof resetPasswordSchema>) => {
        resetPasswordMutation.mutate(data);
    };

    const handleClose = () => {
        onOpenChange(false);
        setStep("request");
        verifyForm.reset();
        resetForm.reset();
        setVerifiedCode("");
    };

    const getDialogTitle = () => {
        if (step === "request") return "Change Password";
        if (step === "verify") return "Verify Identity";
        return "Set New Password";
    };

    const getDialogDescription = () => {
        if (step === "request") return "We'll send a verification code to your email to confirm it's you.";
        if (step === "verify") return "Enter the 6-digit code sent to your email.";
        return "Create a strong password for your account.";
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{getDialogTitle()}</DialogTitle>
                    <DialogDescription>{getDialogDescription()}</DialogDescription>
                </DialogHeader>

                {step === "request" && (
                    <div className="py-4 space-y-4">
                        <div className="flex items-center p-4 bg-muted/50 rounded-lg">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                                <Lock className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">Verify Identity</p>
                                <p className="text-xs text-muted-foreground">{userEmail}</p>
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button variant="outline" onClick={handleClose}>Cancel</Button>
                            <Button onClick={onRequestSubmit} disabled={requestOtpMutation.isPending}>
                                {requestOtpMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Send Verification Code
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {step === "verify" && (
                    <Form {...verifyForm}>
                        <form onSubmit={verifyForm.handleSubmit(onVerifySubmit)} className="space-y-4 pt-4">
                            <FormField
                                control={verifyForm.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Verification Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter 6-digit code" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter className="mt-6">
                                <Button type="button" variant="ghost" onClick={() => setStep("request")}>
                                    Back
                                </Button>
                                <Button type="submit" disabled={verifyOtpMutation.isPending}>
                                    {verifyOtpMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Verify Code
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}

                {step === "reset" && (
                    <Form {...resetForm}>
                        <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4 pt-4">
                            <FormField
                                control={resetForm.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>New Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Enter new password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={resetForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="Confirm new password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter className="mt-6">
                                <Button type="button" variant="ghost" onClick={() => setStep("verify")}>
                                    Back
                                </Button>
                                <Button type="submit" disabled={resetPasswordMutation.isPending}>
                                    {resetPasswordMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Set Password
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}
