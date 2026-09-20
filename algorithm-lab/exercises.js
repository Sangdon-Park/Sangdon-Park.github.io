// Compatibility link: all practice now lives in the original dark workspace.
const target=new URL('./',location.href);
target.search=location.search;
if(!target.searchParams.has('chapter'))target.searchParams.set('chapter','2');
target.searchParams.set('scope','exercises');
location.replace(target.href);
