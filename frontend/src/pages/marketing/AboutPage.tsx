import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SlideUp } from "@/components/ui/motion";

export function AboutPage() {
    return (
        <section className="container py-24 text-center">
            <SlideUp>
                <h1 className="text-3xl font-semibold md:text-4xl">About NEXA</h1>
                <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                    NEXA helps small businesses replace manual work with reliable systems.
                    We build the infrastructure they need to grow — payroll automation,
                    internal dashboards, custom websites, and everything in between.
                </p>
                <div className="mt-8 flex justify-center">
                    <Link to="/contact">
                        <Button size="lg">
                            Get in touch <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </SlideUp>
        </section>
    );
}