import React from 'react';

export enum ButtonType {
    Primary = 'primary',
    Secondary = 'secondary',
    Danger = 'danger',
    Success = 'success',
}

export type Level4 = {
    level4: string;
};

export type Level3 = {
    level3: Level4;
};

export type Level2 = {
    level2: Level3;
};

export type NestedProp = {
    level1: Level2;
};

export type ButtonProps = {
    /**
     * just some text
     * The label of the button.
     * @default 'Click me'
     */
    label: string;
    /**
     * The type of the button.
     * @default ButtonType.Secondary
     */
    type: ButtonType; // Mandatory type
    /**
     * The click handler for the button.
     * @default () => {}
     */
    onClick: () => void;
    /**
     * A nested property with 4 levels of depth.
     */
    nestedProp?: NestedProp;
};

const Button: React.FC<ButtonProps> = ({ label, type = ButtonType.Primary, onClick, nestedProp }) => {
    return (
        <button className={`btn btn-${type}`} onClick={onClick}>
            {label}
        </button>
    );
};

export default Button;