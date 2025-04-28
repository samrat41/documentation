import React from 'react';

export enum ButtonType {
    Primary = 'primary',
    Secondary = 'secondary',
    Danger = 'danger',
    Success = 'success',
}

export type AnotherLevel3 = {
    level4: string;
};

export type AnotherLevel2 = {
    level3: AnotherLevel3;
};

export type AnotherLevel1 = {
    level2: AnotherLevel2;
};

export type AnotherNestedProp = {
    level1: AnotherLevel1;
};

export type AnotherButtonProps = {
    /**
     * just some text
     * The label of the button.
     * @default 'Click me'
     */
    label: string;
    /**
     * The type of the button.
     * @default 'secondary'
     */
    type: ButtonType; // Mandatory type
    /**
     * The click handler for the button.
     * @default () => {}
     */
    onClick?: () => void;
    /**
     * A nested property with 4 levels of depth.
     */
    nestedProp?: AnotherNestedProp;
};

const AnotherButton: React.FC<AnotherButtonProps> = ({ label, type = ButtonType.Primary, onClick, nestedProp }) => {
    return (
        <button className={`btn btn-${type}`} onClick={onClick}>
            {label}
        </button>
    );
};

export default AnotherButton;