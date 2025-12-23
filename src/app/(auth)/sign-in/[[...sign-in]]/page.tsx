import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
            <SignIn
                forceRedirectUrl="/dashboard"
                appearance={{
                    elements: {
                        rootBox: "mx-auto",
                        card: "shadow-xl border-2 border-border rounded-2xl",
                        headerTitle: "text-2xl font-bold",
                        headerSubtitle: "text-muted-foreground",
                        socialButtonsBlockButton: "border-2 border-border rounded-xl h-12",
                        formButtonPrimary: "bg-foreground hover:bg-foreground/90 text-background rounded-xl h-12",
                        formFieldInput: "rounded-xl border-2 border-input",
                        footerActionLink: "text-[#C9A76B]-600 hover:text-[#C9A76B]-700",
                    },
                }}
            />
        </div>
    );
}
