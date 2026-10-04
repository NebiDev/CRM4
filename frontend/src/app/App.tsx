import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { FadeIn, SlideUp, Stagger, StaggerItem } from "@/components/ui/motion";
import { Sparkles } from "lucide-react";

export function App() {
    return (
        <div className="min-h-screen p-8">
            <div className="mx-auto max-w-4xl space-y-8">
                <SlideUp>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Sparkles className="h-5 w-5" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold">NEXA Design System</h1>
                            <p className="text-sm text-muted-foreground">
                                Phase 11 — primitives ready for the real pages.
                            </p>
                        </div>
                    </div>
                </SlideUp>

                <FadeIn delay={0.1}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Buttons</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-3">
                            <Button>Primary</Button>
                            <Button variant="secondary">Secondary</Button>
                            <Button variant="outline">Outline</Button>
                            <Button variant="ghost">Ghost</Button>
                            <Button variant="destructive">Destructive</Button>
                            <Button size="sm">Small</Button>
                            <Button size="lg">Large</Button>
                        </CardContent>
                    </Card>
                </FadeIn>

                <FadeIn delay={0.2}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Form primitives</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="demo-email">Email</Label>
                                <Input id="demo-email" placeholder="you@company.com" />
                            </div>
                            <Badge tone="success">Success</Badge>
                            <Badge tone="warning">Warning</Badge>
                            <Badge tone="danger">Danger</Badge>
                            <Badge tone="info">Info</Badge>
                        </CardContent>
                    </Card>
                </FadeIn>

                <Stagger delay={0.3}>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {[1, 2, 3].map((n) => (
                            <StaggerItem key={n}>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Stagger {n}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm text-muted-foreground">
                                        Motion wrapper demo.
                                    </CardContent>
                                </Card>
                            </StaggerItem>
                        ))}
                    </div>
                </Stagger>
            </div>
        </div>
    );
}