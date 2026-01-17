// Test root import (package.json exports ".")
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@amuaapps/ui-library';

// Test subpath imports (package.json exports "./components/*")
import { Alert, AlertTitle, AlertDescription } from '@amuaapps/ui-library/components/alert';
import { Badge } from '@amuaapps/ui-library/components/badge';
import { Input } from '@amuaapps/ui-library/components/input';
import { Label } from '@amuaapps/ui-library/components/label';

function App() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            UI Library Smoke Test
          </h1>
          <p className="text-muted-foreground">
            Testing selective imports and token CSS application
          </p>
        </div>

        <Alert>
          <AlertTitle>Smoke Test Active</AlertTitle>
          <AlertDescription>
            This page verifies that the library can be imported via root exports and subpath exports,
            and that CSS loads correctly from the package-level styles export.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Component Showcase</CardTitle>
            <CardDescription>
              Testing Button and Card via root import, Alert/Badge/Input/Label via subpath imports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Buttons</h3>
              <div className="flex gap-2 flex-wrap">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Badges</h3>
              <div className="flex gap-2 flex-wrap">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Form Input</h3>
              <div className="space-y-2 max-w-sm">
                <Label htmlFor="test-input">Test Input</Label>
                <Input id="test-input" placeholder="Enter text..." />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              ✓ All components rendered successfully
            </p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Token Verification</CardTitle>
            <CardDescription>
              Checking that design tokens are applied correctly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-2">Colors</p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-background border" />
                    <span>Background</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-foreground" />
                    <span>Foreground</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-primary" />
                    <span>Primary</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-destructive" />
                    <span>Destructive</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Spacing</p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary" />
                    <span>0.5rem (2)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-primary" />
                    <span>1rem (4)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary" />
                    <span>2rem (8)</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
