const storageKey = 'calorie-track-v1';
const state = JSON.parse(localStorage.getItem(storageKey)) || { goal: 2000, meals: [] };
const $ = (s) => document.querySelector(s);
const icons = { Pagi:'☀️', Siang:'🥗', Malam:'🌙', Camilan:'🍎' };
const fmt = n => new Intl.NumberFormat('id-ID').format(n);
const today = new Date();
const iso = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
let selectedDate = iso(today);
let calendarMonth = new Date(today.getFullYear(), today.getMonth(), 1);
state.meals.forEach(meal => { if (!meal.date) meal.date = selectedDate; });
function save(){ localStorage.setItem(storageKey, JSON.stringify(state)); }
function mealsForSelected(){ return state.meals.filter(meal => meal.date === selectedDate); }
function readableDate(dateString, options = { weekday:'long', day:'numeric', month:'long' }){const [year,month,day]=dateString.split('-').map(Number);return new Intl.DateTimeFormat('id-ID',options).format(new Date(year,month-1,day));}
function renderCalendar(){
  $('#monthLabel').textContent=new Intl.DateTimeFormat('id-ID',{month:'long',year:'numeric'}).format(calendarMonth);
  const firstDay=calendarMonth.getDay(),daysInMonth=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth()+1,0).getDate(),grid=$('#calendarGrid');grid.innerHTML='';
  for(let i=0;i<firstDay;i++)grid.append(document.createElement('span'));
  for(let day=1;day<=daysInMonth;day++){const date=new Date(calendarMonth.getFullYear(),calendarMonth.getMonth(),day),dateId=iso(date),button=document.createElement('button');button.className='calendar-day';button.type='button';button.textContent=day;if(dateId===iso(today))button.classList.add('is-today');if(dateId===selectedDate)button.classList.add('is-selected');if(state.meals.some(meal=>meal.date===dateId))button.classList.add('has-entry');button.setAttribute('aria-label',`Catat makanan untuk ${readableDate(dateId)}`);button.onclick=()=>{selectedDate=dateId;render();$('#mealDialog').showModal()};grid.append(button)}
}
function render(){
  const currentMeals=mealsForSelected(),eaten=currentMeals.reduce((sum,m)=>sum+m.calories,0),remaining=Math.max(state.goal-eaten,0),pct=Math.min(eaten/state.goal*100,100);
  $('#dateLabel').textContent=readableDate(selectedDate);$('#todayLabel').textContent=selectedDate===iso(today)?'HARI INI':'TANGGAL TERPILIH';$('#selectedDateLabel').textContent=readableDate(selectedDate,{day:'numeric',month:'long'}).toUpperCase();
  $('#eatenCalories').textContent=fmt(eaten);$('#goalCalories').textContent=fmt(state.goal)+' kkal';$('#goalSmall').textContent=fmt(state.goal);$('#remainingCalories').textContent=fmt(remaining);$('#remainingSmall').textContent=fmt(remaining);$('#progressBar').style.width=pct+'%';$('#calorieRing').style.background=`conic-gradient(var(--green) ${pct*3.6}deg,#ffffff2c 0deg)`;
  const list=$('#mealList');list.innerHTML='';$('#emptyState').hidden=currentMeals.length>0;currentMeals.forEach(meal=>{const node=$('#mealTemplate').content.cloneNode(true);node.querySelector('.meal-icon').textContent=icons[meal.time]||'🍽️';node.querySelector('.meal-copy strong').textContent=meal.name;node.querySelector('.meal-copy span').textContent=meal.time;node.querySelector('.meal-calories').textContent=fmt(meal.calories)+' kkal';node.querySelector('.delete').onclick=()=>{state.meals.splice(state.meals.indexOf(meal),1);save();render()};list.append(node)});renderCalendar();
}
$('#openForm').onclick=()=>$('#mealDialog').showModal();$('#settingsButton').onclick=()=>{$('#goalInput').value=state.goal;$('#settingsDialog').showModal()};$('#previousMonth').onclick=()=>{calendarMonth.setMonth(calendarMonth.getMonth()-1);renderCalendar()};$('#nextMonth').onclick=()=>{calendarMonth.setMonth(calendarMonth.getMonth()+1);renderCalendar()};
const customMealOption = new Option('Makanan lainnya — isi sendiri', 'custom');
$('#mealPreset').append(customMealOption);
$('#mealPreset').addEventListener('change',event=>{if(!event.target.value)return;if(event.target.value==='custom'){$('#mealName').value='';$('#mealCalories').value='';$('#mealName').focus();return}const[name,calories]=event.target.value.split('|');$('#mealName').value=name;$('#mealCalories').value=calories;$('#mealCalories').focus()});
$('#mealForm').addEventListener('submit',e=>{if(e.submitter?.value==='cancel')return;e.preventDefault();state.meals.unshift({name:$('#mealName').value.trim(),calories:+$('#mealCalories').value,time:$('#mealTime').value,date:selectedDate});save();render();e.target.reset();$('#mealDialog').close()});
$('#settingsForm').addEventListener('submit',e=>{if(e.submitter?.value==='cancel')return;e.preventDefault();state.goal=+$('#goalInput').value;save();render();$('#settingsDialog').close()});
save();render();

// Tombol Batal/Tutup harus selalu bekerja, meskipun input wajib belum terisi.
document.querySelectorAll('.dialog-card [value="cancel"]').forEach(button => {
  button.addEventListener('click', event => {
    event.preventDefault();
    button.closest('dialog').close();
  });
});
