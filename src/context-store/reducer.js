export const SHOW_CONFIRM = 'SHOW_CONFIRM';
export const HIDE_CONFIRM = 'HIDE_CONFIRM';

export function reducer(state, action) {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.value };
    case "SET_SELECTED_REGION":
      return { ...state, selectedRegion: action.value };
    case "SET_REGIONS":
      return { ...state, regions: action.value };
    case "SET_LOADING":
      return { ...state, loading: action.value };
    case "SET_NOTIFICATION":
      return { ...state, notification: action.value };
    case "SET_LANGUAGE_CODE":
      return { ...state, languageCode: action.value };
    case "SHOW_CONFIRM":
      return { ...state, show:true, title:action.payload.title, dialogType: action.payload.dialogType,text: action.payload.text};  
    case "HIDE_CONFIRM":
      return {show:false,title:'',text:'', dialogType:''};    
    default:
      return state;
  }
}