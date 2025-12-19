import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
            <SignUp
                appearance={{
                    elements: {
                        rootBox: "mx-auto",
                        card: "shadow-xl border-2 border-border rounded-2xl",
                        headerTitle: "text-2xl font-bold",
                        headerSubtitle: "text-muted-foreground",
                        socialButtonsBlockButton: "border-2 border-border rounded-xl h-12",
                        formButtonPrimary: "bg-foreground hover:bg-foreground/90 text-background rounded-xl h-12",
                        formFieldInput: "rounded-xl border-2 border-input",
                        footerActionLink: "text-accent-600 hover:text-accent-700",
                    },
                }}
            />
        </div>
    );
}
