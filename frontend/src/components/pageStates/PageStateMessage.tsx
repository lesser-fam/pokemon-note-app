import { AppHeader } from "@/components/AppHeader";

type PageStateMessageProps = {
    message: string;
    variant?: "normal" | "error";
};

export const PageStateMessage = ({
    message,
    variant = "normal",
}: PageStateMessageProps) => {
    return (
        <>
            <AppHeader />

            <main className="mx-auto w-full max-w-7xl p-6">
                {variant === "error" ? (
                    <p className="rounded bg-red-100 p-3 text-red-700">
                        {message}
                    </p>
                ) : (
                    <p>{message}</p>
                )}
            </main>
        </>
    );
};
