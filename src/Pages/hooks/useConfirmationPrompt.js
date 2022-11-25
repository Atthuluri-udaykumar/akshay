import { useGlobalState } from  '../../context-store/useGlobalState';//"..//context-store/useGlobalState";
import {HIDE_CONFIRM, SHOW_CONFIRM} from "../../context-store/reducer";

let resolveCallback;
function useConfirmationPrompt() {
    const [confirmState, dispatch] = useGlobalState();
    const onConfirm = () => {
        closeConfirm();
        resolveCallback(true);
    };

    const onCancel = () => {
        closeConfirm();
        resolveCallback(false);
    };
    const confirm = (text,dialogType,title) => {
        dispatch({
            type: SHOW_CONFIRM,
            payload: {
                title: title ? title : '',
                dialogType,
                text
            }
        });
        return new Promise((res, rej) => {
            resolveCallback = res;
        });
    };

    const closeConfirm = () => {
        dispatch({
            type: HIDE_CONFIRM
        });
    };

    return { confirm, onConfirm, onCancel, confirmState };
}

export default useConfirmationPrompt;