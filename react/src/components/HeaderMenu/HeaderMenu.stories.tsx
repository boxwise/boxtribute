import React from 'react';

import { ComponentMeta, ComponentStory } from "@storybook/react";
import HeaderMenu from "./HeaderMenu";

export default {
    title: "General/Header Menu", 
    component: HeaderMenu, 
    parameters: {
        layout: 'fullscreen'
    }
} as ComponentMeta<typeof HeaderMenu>

const Template: ComponentStory<typeof HeaderMenu> = (args) => <HeaderMenu {...args} />

export const Default = (args) => Template.bind({});
Default.args = {
    
}

const { globalPreferences } = useContext(GlobalPreferencesContext);
