import type { Meta, StoryObj } from '@storybook/react';
import { Hero } from './hero';

const meta = {
  title: 'Components/Hero',
  component: Hero,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    height: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
      description: 'Height of the hero section',
    },
    overlay: {
      control: 'select',
      options: ['none', 'light', 'medium', 'dark', 'gradient'],
      description: 'Overlay darkness over the background image',
    },
    align: {
      control: 'select',
      options: ['left', 'center', 'right'],
      description: 'Content alignment',
    },
    backgroundImage: {
      control: 'text',
      description: 'URL of the background image',
    },
    headline: {
      control: 'text',
      description: 'Main headline text',
    },
    subheadline: {
      control: 'text',
      description: 'Supporting subheadline text',
    },
  },
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    headline: "Make a Difference in a Child's Life",
    subheadline:
      'Your sponsorship provides education, healthcare, and hope to children in need around the world.',
    backgroundImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1920&h=1080&fit=crop',
    primaryAction: {
      label: 'Sponsor a Child',
      onClick: () => console.log('Primary action clicked'),
    },
    secondaryAction: {
      label: 'Learn More',
      onClick: () => console.log('Secondary action clicked'),
    },
  },
};

export const CenterAligned: Story = {
  args: {
    headline: 'Transform Lives Through Education',
    subheadline:
      'Join thousands of sponsors who are helping children reach their full potential through quality education and support.',
    backgroundImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1920&h=1080&fit=crop',
    align: 'center',
    overlay: 'dark',
    primaryAction: {
      label: 'Get Started',
      onClick: () => console.log('Get started'),
    },
  },
};

export const LeftAligned: Story = {
  args: {
    headline: 'Every Child Deserves a Chance',
    subheadline:
      'Your monthly contribution helps provide essential resources, mentorship, and opportunities for children to thrive.',
    backgroundImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920&h=1080&fit=crop',
    align: 'left',
    overlay: 'medium',
    height: 'md',
    primaryAction: {
      label: 'Sponsor Now',
      onClick: () => console.log('Sponsor now'),
    },
    secondaryAction: {
      label: 'View Programs',
      onClick: () => console.log('View programs'),
    },
  },
};

export const RightAligned: Story = {
  args: {
    headline: 'Building Brighter Futures',
    subheadline: 'Support programs that empower children with the tools they need to succeed.',
    backgroundImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1920&h=1080&fit=crop',
    align: 'right',
    overlay: 'gradient',
    height: 'lg',
    primaryAction: {
      label: 'Make an Impact',
      onClick: () => console.log('Make an impact'),
    },
  },
};

export const FullHeight: Story = {
  args: {
    headline: 'Change Starts With You',
    subheadline:
      'Be part of a global movement dedicated to creating lasting change in the lives of vulnerable children.',
    backgroundImage: 'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=1920&h=1080&fit=crop',
    height: 'full',
    overlay: 'dark',
    align: 'center',
    primaryAction: {
      label: 'Join Our Mission',
      onClick: () => console.log('Join mission'),
    },
    secondaryAction: {
      label: 'Watch Video',
      onClick: () => console.log('Watch video'),
    },
  },
};

export const NoOverlay: Story = {
  args: {
    headline: 'Hope for Every Child',
    subheadline: 'Together, we can create a world where every child has access to education and care.',
    backgroundImage: 'https://images.unsplash.com/photo-1529390079861-591de354faf5?w=1920&h=1080&fit=crop',
    overlay: 'none',
    primaryAction: {
      label: 'Start Sponsoring',
      onClick: () => console.log('Start sponsoring'),
    },
  },
};

export const LightOverlay: Story = {
  args: {
    headline: 'Invest in Their Future',
    subheadline:
      'Your support helps break the cycle of poverty and opens doors to new possibilities.',
    backgroundImage: 'https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=1920&h=1080&fit=crop',
    overlay: 'light',
    height: 'xl',
    primaryAction: {
      label: 'Become a Sponsor',
      onClick: () => console.log('Become a sponsor'),
    },
    secondaryAction: {
      label: 'Our Impact',
      onClick: () => console.log('Our impact'),
    },
  },
};

export const WithLinks: Story = {
  args: {
    headline: 'Empower Through Education',
    subheadline:
      'Sponsor a child today and help them build the skills and confidence they need for tomorrow.',
    backgroundImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1920&h=1080&fit=crop',
    overlay: 'medium',
    primaryAction: {
      label: 'Sponsor a Child',
      href: '/sponsor',
    },
    secondaryAction: {
      label: 'Learn More',
      href: '/about',
    },
  },
};

export const NoBackground: Story = {
  args: {
    headline: 'Make a Lasting Impact',
    subheadline:
      "Join our community of sponsors committed to creating positive change in children's lives.",
    overlay: 'none',
    primaryAction: {
      label: 'Get Involved',
      onClick: () => console.log('Get involved'),
    },
  },
};

export const HeadlineOnly: Story = {
  args: {
    headline: 'Every Child Matters',
    backgroundImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1920&h=1080&fit=crop',
    overlay: 'dark',
  },
};
