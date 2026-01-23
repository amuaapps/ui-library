import type { Meta, StoryObj } from '@storybook/react';
import { DialogBox } from './dialog-box';
import { BookOpen, Utensils, Heart, Home, Users } from 'lucide-react';

const meta = {
  title: 'Composite Components/DialogBox',
  component: DialogBox,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof DialogBox>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleItems = [
  {
    id: 'education',
    icon: <BookOpen className="h-5 w-5" />,
    title: 'Education',
    content: (
      <div className="space-y-4">
        <p className="text-ui-body-sm text-muted-foreground">
          Our comprehensive education program provides access to quality learning resources,
          tutoring services, and educational materials. We support students from elementary
          through high school with personalized learning plans and academic mentorship.
        </p>
        <img
          src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=300&fit=crop"
          alt="Education"
          className="w-full h-48 object-cover rounded-md"
        />
      </div>
    ),
  },
  {
    id: 'nutrition',
    icon: <Utensils className="h-5 w-5" />,
    title: 'Nutrition',
    content: (
      <div className="space-y-4">
        <p className="text-ui-body-sm text-muted-foreground">
          Ensuring proper nutrition is essential for healthy development. Our program provides
          nutritious meals, dietary guidance, and food assistance to families in need. We work
          with nutritionists to create balanced meal plans tailored to each child's needs.
        </p>
        <img
          src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=300&fit=crop"
          alt="Nutrition"
          className="w-full h-48 object-cover rounded-md"
        />
      </div>
    ),
  },
  {
    id: 'healthcare',
    icon: <Heart className="h-5 w-5" />,
    title: 'Healthcare',
    content: (
      <div className="space-y-4">
        <p className="text-ui-body-sm text-muted-foreground">
          Access to quality healthcare is a fundamental right. We provide comprehensive medical
          care including regular check-ups, vaccinations, dental care, and emergency medical
          services. Our network of healthcare providers ensures children receive the care they need.
        </p>
        <img
          src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=300&fit=crop"
          alt="Healthcare"
          className="w-full h-48 object-cover rounded-md"
        />
      </div>
    ),
  },
  {
    id: 'family-support',
    icon: <Home className="h-5 w-5" />,
    title: 'Family Support',
    content: (
      <div className="space-y-4">
        <p className="text-ui-body-sm text-muted-foreground">
          Strong families create strong communities. Our family support services include parenting
          workshops, financial literacy programs, housing assistance, and counseling services.
          We help families build stable, nurturing environments for children to thrive.
        </p>
        <img
          src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&h=300&fit=crop"
          alt="Family Support"
          className="w-full h-48 object-cover rounded-md"
        />
      </div>
    ),
  },
  {
    id: 'mentorship',
    icon: <Users className="h-5 w-5" />,
    title: 'Mentorship',
    content: (
      <div className="space-y-4">
        <p className="text-ui-body-sm text-muted-foreground">
          Every child deserves a positive role model. Our mentorship program connects children
          with caring adults who provide guidance, support, and encouragement. Mentors help
          children develop confidence, set goals, and navigate life's challenges.
        </p>
        <img
          src="https://images.unsplash.com/photo-1529390079861-591de354faf5?w=600&h=300&fit=crop"
          alt="Mentorship"
          className="w-full h-48 object-cover rounded-md"
        />
      </div>
    ),
  },
];

export const Default: Story = {
  render: () => (
    <DialogBox
      title="With $49/mo. your sponsored child will get access to:"
      items={sampleItems}
    />
  ),
};

export const WithoutIcons: Story = {
  render: () => (
    <DialogBox
      title="Program Benefits"
      items={sampleItems.map((item) => ({ ...item, icon: undefined }))}
    />
  ),
};

export const FewItems: Story = {
  render: () => (
    <DialogBox
      title="Core Services"
      items={sampleItems.slice(0, 3)}
    />
  ),
};
