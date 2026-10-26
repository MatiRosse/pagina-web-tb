(() => {
  const form = document.querySelector('#tramites-filters');
  if (!form) return;
  const search = form.querySelector('[name="buscar"]');
  const jurisdiction = form.querySelector('[name="jurisdiccion"]');
  const sort = form.querySelector('[name="orden"]');
  const buttons = [...form.querySelectorAll('[data-category]')];
  const grid = document.querySelector('#tramites-grid');
  const cards = [...grid.querySelectorAll('[data-tramite]')];
  const count = document.querySelector('#tramites-count');
  const empty = document.querySelector('#tramites-empty');
  const more = document.querySelector('#tramites-more');
  const reset = document.querySelector('#tramites-reset');
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  let category = 'todos';
  let limit = 9;
  const params = new URLSearchParams(location.search);
  search.value = params.get('buscar') || '';
  if ([...jurisdiction.options].some(o=>o.value===params.get('jurisdiccion'))) jurisdiction.value=params.get('jurisdiccion');
  if (buttons.some(b=>b.dataset.category===params.get('categoria'))) category=params.get('categoria');
  cards.forEach(card=>card.searchText=normalize(card.dataset.search));
  function update() {
    const terms=normalize(search.value.trim()).split(/\s+/).filter(Boolean);
    let matches=cards.filter(card => (category==='todos'||card.dataset.category===category) && (!jurisdiction.value||card.dataset.jurisdiction===jurisdiction.value) && terms.every(term=>card.searchText.includes(term)));
    if(sort.value==='precio') matches.sort((a,b)=>Number(a.dataset.price)-Number(b.dataset.price));
    if(sort.value==='nombre') matches.sort((a,b)=>a.dataset.title.localeCompare(b.dataset.title,'es'));
    cards.forEach(card=>{card.hidden=true;});
    matches.forEach((card,i)=>{card.hidden=i>=limit;grid.append(card);});
    buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.category===category)));
    count.textContent=`${matches.length} ${matches.length===1?'trámite encontrado':'trámites encontrados'}${matches.length>limit?` · mostrando ${limit}`:''}`;
    empty.hidden=matches.length!==0;
    more.hidden=matches.length<=limit;
    more.textContent=`Ver más trámites (${Math.max(0,matches.length-limit)} restantes)`;
    reset.hidden=!(terms.length||category!=='todos'||jurisdiction.value||sort.value!=='relevancia');
  }
  form.addEventListener('submit',event=>event.preventDefault());
  search.addEventListener('input',()=>{limit=9;update();});
  jurisdiction.addEventListener('change',()=>{limit=9;update();});
  sort.addEventListener('change',()=>{limit=9;update();});
  buttons.forEach(button=>button.addEventListener('click',()=>{category=button.dataset.category;limit=9;update();}));
  document.querySelectorAll('[data-shortcut]').forEach(link=>link.addEventListener('click',()=>{
    category=link.dataset.shortcut;search.value='';jurisdiction.value='';limit=9;update();
  }));
  more.addEventListener('click',()=>{
    const visible=cards.filter(card=>!card.hidden).length;
    limit+=9;update();
    const firstNew=[...grid.children].filter(card=>!card.hidden)[visible];
    if(firstNew) {firstNew.querySelector('h3').focus({preventScroll:true});firstNew.scrollIntoView({block:'nearest',behavior:'smooth'});}
  });
  reset.addEventListener('click',()=>{form.reset();category='todos';limit=9;update();search.focus();});
  function showLinkedCard() {
    const linked=cards.find(card=>'#'+card.id===location.hash);
    if (!linked) return;
    search.value=linked.dataset.title;
    jurisdiction.value=linked.dataset.jurisdiction;
    category=linked.dataset.category;
    limit=9;
    update();
    requestAnimationFrame(()=>linked.scrollIntoView({block:'start'}));
  }
  form.hidden=false;
  update();
  showLinkedCard();
  window.addEventListener('hashchange',showLinkedCard);
})();
