import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SlideUp } from "@/components/ui/motion";

export function ServicesPage() {
    return (
        <section className="container py-24 text-center">
            <SlideUp>
                <h1 className="text-3xl font-semibold md:text-4xl">Our services</h1>
                <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                    We focus on four areas: business automation, digital infrastructure,
                    payroll and accounting systems, and custom internal tools. Each engagement
                    is scoped and priced after a short audit call.
                </p>
                <div className="mt-8 flex justify-center gap-3">
                    <Link to="/contact">
                        <Button size="lg">
                            Book a consultation <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Link to="/">
                        <Button size="lg" variant="outline">Back to home</Button>
                    </Link>
                </div>
            </SlideUp>
        </section>
    );
}