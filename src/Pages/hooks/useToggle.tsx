import { useState } from "react";

export const useToggle = (initialValue: boolean = false) => {
	const [isToggled, setToggle] = useState<boolean>(initialValue);
	const toggle = (): void => setToggle((prevState) => !prevState);
	return { isToggled, setToggle, toggle };
};

