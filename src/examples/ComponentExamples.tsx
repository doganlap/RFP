/**
 * Component Examples - Quick Reference Guide
 * Copy and paste these examples to use the enterprise components
 */
import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardBody, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Search, Download, Upload, CheckCircle } from 'lucide-react';

export const ComponentExamples: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ email: '', name: '' });

  return (
    <div className="p-8 space-y-12 bg-gray-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Component Examples</h1>
        <p className="text-gray-600 mt-2">
          Quick reference for using enterprise UI components
        </p>
      </div>

      {/* Button Examples */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Buttons</h2>
        <Card>
          <CardBody>
            <div className="space-y-4">
              {/* Variants */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Variants</h3>
                <div className="flex flex-wrap gap-2">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                  <Button variant="success">Success</Button>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Sizes</h3>
                <div className="flex flex-wrap items-end gap-2">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                  <Button size="xl">Extra Large</Button>
                </div>
              </div>

              {/* With Icons */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">With Icons</h3>
                <div className="flex flex-wrap gap-2">
                  <Button leftIcon={<Download className="h-4 w-4" />}>Download</Button>
                  <Button rightIcon={<Upload className="h-4 w-4" />}>Upload</Button>
                  <Button
                    leftIcon={<Search className="h-4 w-4" />}
                    variant="outline"
                  >
                    Search
                  </Button>
                </div>
              </div>

              {/* States */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">States</h3>
                <div className="flex flex-wrap gap-2">
                  <Button isLoading>Loading</Button>
                  <Button disabled>Disabled</Button>
                  <Button fullWidth>Full Width</Button>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* Card Examples */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="default">
            <CardHeader title="Default Card" subtitle="With shadow" />
            <CardBody>
              <p className="text-gray-600">This is a default card with shadow styling.</p>
            </CardBody>
          </Card>

          <Card variant="bordered">
            <CardHeader title="Bordered Card" subtitle="With border" />
            <CardBody>
              <p className="text-gray-600">This is a bordered card without shadow.</p>
            </CardBody>
          </Card>

          <Card variant="elevated">
            <CardHeader title="Elevated Card" subtitle="With large shadow" />
            <CardBody>
              <p className="text-gray-600">This is an elevated card with larger shadow.</p>
            </CardBody>
            <CardFooter>
              <Button variant="outline" size="sm">
                Action
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Input Examples */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Inputs</h2>
        <Card>
          <CardBody>
            <div className="space-y-4">
              <Input label="Email" type="email" placeholder="Enter your email" required />

              <Input
                label="Search"
                type="text"
                placeholder="Search..."
                leftIcon={<Search className="h-5 w-5 text-gray-400" />}
              />

              <Input
                label="Name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                helperText="Enter your full name"
              />

              <Input
                label="Password"
                type="password"
                error="Password must be at least 8 characters"
              />

              <Input label="Disabled Input" type="text" disabled value="Disabled" />
            </div>
          </CardBody>
        </Card>
      </section>

      {/* Badge Examples */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Badges</h2>
        <Card>
          <CardBody>
            <div className="space-y-4">
              {/* Variants */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Variants</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="danger">Danger</Badge>
                  <Badge variant="info">Info</Badge>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Sizes</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge size="sm" variant="success">
                    Small
                  </Badge>
                  <Badge size="md" variant="success">
                    Medium
                  </Badge>
                  <Badge size="lg" variant="success">
                    Large
                  </Badge>
                </div>
              </div>

              {/* With Dots */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">With Status Dots</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="success" dot>
                    Active
                  </Badge>
                  <Badge variant="warning" dot>
                    Pending
                  </Badge>
                  <Badge variant="danger" dot>
                    Rejected
                  </Badge>
                </div>
              </div>

              {/* Use Cases */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Real-World Use Cases
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">RFP Status:</span>
                    <Badge variant="info">In Review</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Priority:</span>
                    <Badge variant="danger">High</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Stage:</span>
                    <Badge variant="success">Stage 3 - SME Qualification</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* Modal Example */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Modal</h2>
        <Card>
          <CardBody>
            <div className="space-y-4">
              <p className="text-gray-600">
                Click the button below to open a modal dialog
              </p>
              <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>

              <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Example Modal"
                size="md"
                footer={
                  <>
                    <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => {
                        alert('Confirmed!');
                        setIsModalOpen(false);
                      }}
                    >
                      Confirm
                    </Button>
                  </>
                }
              >
                <p className="text-gray-600">
                  This is an example modal with a title, body content, and footer actions.
                </p>
                <p className="text-gray-600 mt-4">
                  Press Escape or click outside to close.
                </p>
              </Modal>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* Complete Form Example */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Form Example</h2>
        <Card>
          <CardHeader title="Create New RFP" subtitle="Enter RFP details below" />
          <CardBody>
            <form className="space-y-4">
              <Input label="RFP Title" type="text" placeholder="Enterprise Cloud Migration" required />

              <Input label="Client Name" type="text" placeholder="Acme Corporation" required />

              <Input
                label="Estimated Value"
                type="number"
                placeholder="25000000"
                leftIcon={<span className="text-gray-500">$</span>}
                helperText="Enter the estimated contract value"
              />

              <Input
                label="Submission Deadline"
                type="date"
                required
                helperText="Date by which the proposal must be submitted"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <div className="flex gap-2">
                  <Badge variant="default">Low</Badge>
                  <Badge variant="warning">Medium</Badge>
                  <Badge variant="danger">High</Badge>
                </div>
              </div>
            </form>
          </CardBody>
          <CardFooter>
            <div className="flex justify-end gap-3">
              <Button variant="outline">Cancel</Button>
              <Button variant="primary" leftIcon={<CheckCircle className="h-4 w-4" />}>
                Create RFP
              </Button>
            </div>
          </CardFooter>
        </Card>
      </section>

      {/* Code Examples */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Code Examples</h2>
        <Card>
          <CardBody>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Basic Button Usage
                </h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm">
{`import { Button } from '@components/ui';

<Button variant="primary" size="md">
  Click Me
</Button>`}
                </pre>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Card with Content
                </h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm">
{`import { Card, CardHeader, CardBody } from '@components/ui';

<Card>
  <CardHeader title="My Card" subtitle="Description" />
  <CardBody>
    <p>Card content goes here</p>
  </CardBody>
</Card>`}
                </pre>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Form Input</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto text-sm">
{`import { Input } from '@components/ui';

<Input
  label="Email"
  type="email"
  placeholder="user@example.com"
  required
  helperText="We'll never share your email"
/>`}
                </pre>
              </div>
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  );
};
