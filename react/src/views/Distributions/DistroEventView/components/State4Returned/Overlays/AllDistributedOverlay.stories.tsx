import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';
import AllDistributedOverlay from './AllDistributedOverlay';
import { action } from '@storybook/addon-actions';


export default {
  title: 'Mobile Distro Events/Distro Events/Detail View/State: 4 - Returned/AllDistributedOverlay',
  component: AllDistributedOverlay,
  parameters: {
  },
} as ComponentMeta<typeof AllDistributedOverlay>;

const Template: ComponentStory<typeof AllDistributedOverlay> = (args) => <AllDistributedOverlay  {...args}/>;

export const Default = Template.bind({});
Default.args = {
    modalProps: {
        isOpen: true,
        onClose: action("onClose"),
        },
    actionProps: {
        onCancel: action("onCancel"),
        onConfirm: action("onConfirm"),
    }
}

