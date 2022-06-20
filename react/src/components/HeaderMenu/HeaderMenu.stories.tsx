import React from 'react';

import { ComponentMeta, ComponentStory } from "@storybook/react";
import HeaderMenu from "./HeaderMenu";
import { action } from '@storybook/addon-actions';

export default {
    title: "General/Header Menu", 
    component: HeaderMenu, 
    parameters: {
        layout: 'fullscreen'
    }
} as ComponentMeta<typeof HeaderMenu>

const Template: ComponentStory<typeof HeaderMenu> = (args) => <HeaderMenu {...args} />

export const Default = Template.bind({});
Default.args = {
    loginWithRedirect: action("loginWithRedirect was clicked")
}

export const LoggedIn = Template.bind({});
LoggedIn.args = {
    ...Default.args,
    isAuthenticated: true,
    user: {
        picture: "/some/picture/path.jpg",
        email: "emil@ngo.org"
    }
}

// const { globalPreferences } = useContext(GlobalPreferencesContext);
