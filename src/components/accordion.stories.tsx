import type { Meta, StoryObj } from '@storybook/react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './accordion';
import { BarChart3, Plug2, Shield } from 'lucide-react';

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-[450px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that matches the other components aesthetic.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>
          Yes. It's animated by default, but you can disable it if you prefer.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" className="w-[450px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>Section 1</AccordionTrigger>
        <AccordionContent>
          This accordion allows multiple sections to be open at the same time.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Section 2</AccordionTrigger>
        <AccordionContent>Try opening multiple sections simultaneously.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Section 3</AccordionTrigger>
        <AccordionContent>All sections can be open at once.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const DefaultOpen: Story = {
  render: () => (
    <Accordion type="single" defaultValue="item-2" collapsible className="w-[450px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>First Item</AccordionTrigger>
        <AccordionContent>First item content.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Second Item (Open by Default)</AccordionTrigger>
        <AccordionContent>
          This item is open by default using the defaultValue prop.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Third Item</AccordionTrigger>
        <AccordionContent>Third item content.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const RichContent: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-[600px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <span className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Product Features
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <p className="text-ui-body-sm text-muted-foreground">
              Our comprehensive analytics dashboard provides real-time insights into your data.
              Track key metrics, visualize trends, and make data-driven decisions with ease.
              The intuitive interface makes it simple to understand complex data patterns.
            </p>
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=300&fit=crop"
              alt="Product dashboard"
              className="w-full h-48 object-cover rounded-md"
            />
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>
          <span className="flex items-center gap-2">
            <Plug2 className="h-5 w-5" />
            Integration Capabilities
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <p className="text-ui-body-sm text-muted-foreground">
              Connect with over 100+ popular tools and services. Our API-first approach ensures
              smooth integration with your existing workflow. From CRM systems to marketing
              automation platforms, we've got you covered with pre-built connectors and webhooks.
            </p>
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=300&fit=crop"
              alt="Integration network"
              className="w-full h-48 object-cover rounded-md"
            />
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>
          <span className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Compliance
          </span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <p className="text-ui-body-sm text-muted-foreground">
              Your data security is our top priority. We employ industry-leading encryption
              standards, regular security audits, and compliance with GDPR, SOC 2, and ISO 27001.
              Multi-factor authentication and role-based access control ensure your information
              stays protected at all times.
            </p>
            <img
              src="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&h=300&fit=crop"
              alt="Security lock"
              className="w-full h-48 object-cover rounded-md"
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
