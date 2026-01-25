import type { Meta, StoryObj } from '@storybook/react';
import { AccordionBox } from './accordion-box';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './accordion';
import { BarChart3, Plug2, Shield } from 'lucide-react';

const meta = {
  title: 'Composite Components/AccordionBox',
  component: AccordionBox,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AccordionBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <AccordionBox title="Frequently Asked Questions">
      <Accordion type="single" collapsible>
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
    </AccordionBox>
  ),
};

export const RichContent: Story = {
  render: () => (
    <AccordionBox title="Product Information">
      <Accordion type="single" collapsible>
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
                Track key metrics, visualize trends, and make data-driven decisions with ease. The
                intuitive interface makes it simple to understand complex data patterns.
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
    </AccordionBox>
  ),
};

export const MultipleOpen: Story = {
  render: () => (
    <AccordionBox title="Help Center">
      <Accordion type="multiple">
        <AccordionItem value="item-1">
          <AccordionTrigger>Getting Started</AccordionTrigger>
          <AccordionContent>
            Welcome to our platform! This section will help you get up and running quickly. Follow
            the setup guide and you'll be ready in minutes.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Account Management</AccordionTrigger>
          <AccordionContent>
            Learn how to manage your account settings, update your profile, and configure
            preferences to suit your needs.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Billing & Subscriptions</AccordionTrigger>
          <AccordionContent>
            Information about pricing plans, payment methods, and how to manage your subscription.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </AccordionBox>
  ),
};
