export const wrapIndex = (i, count) => {
 const length=Math.trunc(Number(count)),value=Number(i);
 if(!Number.isFinite(length)||length<1||!Number.isFinite(value))return 0;
 return ((Math.trunc(value)%length)+length)%length;
};
export const initialState = { screen:'home', view:'gallery', selected:0, intensity:50, family:0 };
export function parseRoute(path) {
  const clean=path.replace(/\/+$/,'');
  return {screen:clean.endsWith('/quiz/1')?'notes':clean.endsWith('/quiz')?'intensity':clean.endsWith('/layering')?'collection':'home'};
}
export function recommend(family,intensity) {
  return family==='oud'?3:family==='woods'?0:family==='flowers'?(intensity>65?2:1):2;
}
export function reduce(state, action) {
  switch(action.type){
    case 'screen': return {...state,screen:action.screen};
    case 'view': return {...state,view:action.view==='list'?'list':'gallery'};
    case 'select': return {...state,selected:wrapIndex(Number.isFinite(action.index)?action.index:0,4)};
    case 'intensity': return {...state,intensity:Math.max(0,Math.min(100,Number(action.value)||0))};
    case 'family': return {...state,family:wrapIndex(action.index,4)};
    default:return state;
  }
}
