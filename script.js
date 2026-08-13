const API="http://localhost:3000/api";

const preloader=document.getElementById("preloader");
window.addEventListener("load",()=>setTimeout(()=>preloader.classList.add("hide"),850));

const menuBtn=document.querySelector(".menu-btn"),navLinks=document.querySelector(".nav-links");
menuBtn?.addEventListener("click",()=>{const active=navLinks.classList.toggle("active");menuBtn.setAttribute("aria-expanded",active)});
document.querySelectorAll(".nav-links a").forEach(a=>a.addEventListener("click",()=>navLinks.classList.remove("active")));
document.getElementById("year").textContent=new Date().getFullYear();

const dateInput=document.getElementById("date");
const dateDisplay=document.getElementById("dateDisplay");
const calendar=document.getElementById("jalaliCalendar");
const calendarTitle=document.getElementById("calendarTitle");
const calendarDays=document.getElementById("calendarDays");
const calendarToggle=document.getElementById("calendarToggle");
const prevMonth=document.getElementById("prevMonth");
const nextMonth=document.getElementById("nextMonth");
const slotsBox=document.getElementById("slots");
const selectedTime=document.getElementById("selectedTime");
const appointmentForm=document.getElementById("appointmentForm");
const message=document.getElementById("appointmentMessage");const otpCode=document.getElementById("otpCode");const sendOtp=document.getElementById("sendOtp");const verifyOtp=document.getElementById("verifyOtp");const otpStatus=document.getElementById("otpStatus");let phoneVerified=false;
function normalizePhone(p){
  return String(p||"").replace(/[۰-۹]/g,d=>"۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/[٠-٩]/g,d=>"٠١٢٣٤٥٦٧٨٩".indexOf(d));
}
function resetPhoneVerification(){
  phoneVerified=false;
  if(otpCode){otpCode.disabled=true;otpCode.value="";}
  if(verifyOtp)verifyOtp.disabled=true;
  if(sendOtp)sendOtp.disabled=false;
  if(otpStatus){otpStatus.textContent="برای ثبت نوبت، ابتدا شماره موبایل را تأیید کنید.";otpStatus.className="date-hint";}
}
const phoneField=document.getElementById("phone");
phoneField?.addEventListener("input",resetPhoneVerification);
sendOtp?.addEventListener("click",async()=>{
  const phone=normalizePhone(phoneField.value.trim());
  if(!/^09\d{9}$/.test(phone)){otpStatus.textContent="شماره موبایل معتبر نیست.";otpStatus.className="date-hint error";return;}
  sendOtp.disabled=true;
  try{
    const r=await fetch(`${API}/otp/request`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone})});
    const d=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(d.message||"ارسال کد ناموفق بود.");
    otpCode.disabled=false;verifyOtp.disabled=false;otpCode.focus();
    otpStatus.textContent="کد تأیید ارسال شد. ۲ دقیقه فرصت دارید.";
    if(d.devCode)otpStatus.textContent+=` کد آزمایشی: ${d.devCode}`;
    otpStatus.className="date-hint success";
  }catch(e){otpStatus.textContent=e.message;otpStatus.className="date-hint error";}
  finally{sendOtp.disabled=false;}
});
verifyOtp?.addEventListener("click",async()=>{
  const phone=normalizePhone(phoneField.value.trim()),code=normalizePhone(otpCode.value.trim());
  if(!/^09\d{9}$/.test(phone)||!/^\d{6}$/.test(code)){otpStatus.textContent="شماره یا کد تأیید نامعتبر است.";otpStatus.className="date-hint error";return;}
  try{
    const r=await fetch(`${API}/otp/verify`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone,code})});
    const d=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(d.message||"کد تأیید اشتباه است.");
    phoneVerified=true;otpCode.disabled=true;verifyOtp.disabled=true;sendOtp.disabled=true;
    otpStatus.textContent="✓ شماره موبایل با موفقیت تأیید شد.";otpStatus.className="date-hint success";
  }catch(e){phoneVerified=false;otpStatus.textContent=e.message;otpStatus.className="date-hint error";}
});

const pad=n=>String(n).padStart(2,"0");
const faDigits=s=>String(s).replace(/\d/g,d=>"۰۱۲۳۴۵۶۷۸۹"[d]);
const enDigits=s=>String(s).replace(/[۰-۹]/g,d=>"۰۱۲۳۴۵۶۷۸۹".indexOf(d));

const jalaliMonths=[
  "فروردین","اردیبهشت","خرداد","تیر","مرداد","شهریور",
  "مهر","آبان","آذر","دی","بهمن","اسفند"
];

function gregorianToJalali(gy,gm,gd){
  const gdm=[0,31,59,90,120,151,181,212,243,273,304,334];
  let gy2=gy+1, jy;
  let days=355666+(365*gy)+Math.floor((gy2+3)/4)-Math.floor((gy2+99)/100)+Math.floor((gy2+399)/400)+gd+gdm[gm-1];
  if(gm>2 && ((gy%4===0&&gy%100!==0)||(gy%400===0))) days++;
  jy=-1595+33*Math.floor(days/12053);
  days%=12053;
  jy+=4*Math.floor(days/1461);
  days%=1461;
  if(days>365){
    jy+=Math.floor((days-1)/365);
    days=(days-1)%365;
  }
  const jm=days<186?1+Math.floor(days/31):7+Math.floor((days-186)/30);
  const jd=1+(days<186?days%31:(days-186)%30);
  return {jy,jm,jd};
}

function jalaliToGregorian(jy,jm,jd){
  let jy2=jy-979, days=365*jy2+Math.floor(jy2/33)*8+Math.floor((jy2%33+3)/4);
  for(let i=1;i<jm;i++) days+=(i<=6?31:30);
  days+=jd-1;
  let gy=1600+400*Math.floor(days/146097);
  days%=146097;
  let leap=true;
  if(days>=36525){
    days--;
    gy+=100*Math.floor(days/36524);
    days%=36524;
    if(days>=365) days++;
    else leap=false;
  }
  gy+=4*Math.floor(days/1461);
  days%=1461;
  if(days>=366){
    leap=false;
    days--;
    gy+=Math.floor(days/365);
    days%=365;
  }
  const gd=days+1;
  const gdm=[31,(leap?29:28),31,30,31,30,31,31,30,31,30,31];
  let gm=1;
  let d=gd;
  for(const md of gdm){
    if(d<=md) break;
    d-=md; gm++;
  }
  return {gy,gm,gd:d};
}

function dateOnly(d=new Date()){
  return new Date(d.getFullYear(),d.getMonth(),d.getDate());
}

const todayGregorian=dateOnly();
const todayJ=gregorianToJalali(
  todayGregorian.getFullYear(),todayGregorian.getMonth()+1,todayGregorian.getDate()
);

let viewJ={jy:todayJ.jy,jm:todayJ.jm};

function jalaliMonthLength(jy,jm){
  if(jm<=6) return 31;
  if(jm<=11) return 30;
  return isJalaliLeap(jy)?30:29;
}
function isJalaliLeap(jy){
  // A Jalali year is leap when the interval between its Farvardin 1
  // and the next year's Farvardin 1 is 366 days.
  const a=jalaliToGregorian(jy,1,1);
  const b=jalaliToGregorian(jy+1,1,1);
  const da=Date.UTC(a.gy,a.gm-1,a.gd);
  const db=Date.UTC(b.gy,b.gm-1,b.gd);
  return Math.round((db-da)/86400000)===366;
}
function compareJ(a,b){
  if(a.jy!==b.jy) return a.jy-b.jy;
  if(a.jm!==b.jm) return a.jm-b.jm;
  return a.jd-b.jd;
}
function toGregorianString(j){
  const g=jalaliToGregorian(j.jy,j.jm,j.jd);
  return `${g.gy}-${pad(g.gm)}-${pad(g.gd)}`;
}
function toJalaliDisplay(j){
  return `${faDigits(j.jy)}/${faDigits(pad(j.jm))}/${faDigits(pad(j.jd))}`;
}
function isSameJ(a,b){return a.jy===b.jy&&a.jm===b.jm&&a.jd===b.jd;}

function renderCalendar(){
  calendarTitle.textContent=`${jalaliMonths[viewJ.jm-1]} ${faDigits(viewJ.jy)}`;
  calendarDays.innerHTML="";
  const firstG=jalaliToGregorian(viewJ.jy,viewJ.jm,1);
  const firstDate=new Date(firstG.gy,firstG.gm-1,firstG.gd);
  // JavaScript: Sunday=0. Persian week starts Saturday, so Saturday=0.
  const startIndex=(firstDate.getDay()+1)%7;
  for(let i=0;i<startIndex;i++){
    const empty=document.createElement("span");
    empty.className="calendar-day empty";
    calendarDays.appendChild(empty);
  }

  const days=jalaliMonthLength(viewJ.jy,viewJ.jm);
  const selected=dateInput.value ? (()=> {
    const [gy,gm,gd]=dateInput.value.split("-").map(Number);
    return gregorianToJalali(gy,gm,gd);
  })() : null;

  for(let day=1;day<=days;day++){
    const btn=document.createElement("button");
    btn.type="button";
    btn.className="calendar-day";
    const current={jy:viewJ.jy,jm:viewJ.jm,jd:day};
    btn.textContent=faDigits(day);
    if(compareJ(current,todayJ)<0) btn.disabled=true;
    if(selected&&isSameJ(current,selected)) btn.classList.add("selected");
    if(isSameJ(current,todayJ)) btn.classList.add("today");
    btn.addEventListener("click",()=>{
      dateInput.value=toGregorianString(current);
      dateDisplay.value=toJalaliDisplay(current);
      viewJ={jy:current.jy,jm:current.jm};
      calendar.hidden=true;
      loadSlots();
    });
    calendarDays.appendChild(btn);
  }
}

calendarToggle.addEventListener("click",()=>{
  calendar.hidden=!calendar.hidden;
  if(!calendar.hidden) renderCalendar();
});
dateDisplay.addEventListener("click",()=>{calendar.hidden=false;renderCalendar()});
prevMonth.addEventListener("click",()=>{
  viewJ.jm--;
  if(viewJ.jm<1){viewJ.jm=12;viewJ.jy--;}
  renderCalendar();
});
nextMonth.addEventListener("click",()=>{
  viewJ.jm++;
  if(viewJ.jm>12){viewJ.jm=1;viewJ.jy++;}
  renderCalendar();
});
document.addEventListener("click",e=>{
  if(!e.target.closest(".date-picker")) calendar.hidden=true;
});

function isWorkingDay(s){
  const d=new Date(`${s}T12:00:00`).getDay();
  // شنبه تا چهارشنبه
  return [6,0,1,2,3].includes(d);
}

async function loadSlots(){
  selectedTime.value="";
  document.querySelectorAll(".slot").forEach(x=>x.classList.remove("selected"));
  if(!dateInput.value){
    slotsBox.innerHTML='<p class="muted">ابتدا تاریخ را انتخاب کنید.</p>';
    return;
  }
  if(!isWorkingDay(dateInput.value)){
    slotsBox.innerHTML='<p class="muted">ساعات کاری از شنبه تا چهارشنبه است. لطفاً یک روز کاری انتخاب کنید.</p>';
    return;
  }
  slotsBox.innerHTML='<p class="muted">در حال دریافت ساعت‌های آزاد...</p>';
  try{
    const res=await fetch(`${API}/appointments/availability?date=${encodeURIComponent(dateInput.value)}`);
    if(!res.ok) throw new Error();
    const data=await res.json();
    slotsBox.innerHTML="";
    if(data.closed){
      slotsBox.innerHTML='<p class="muted">این روز توسط مطب بسته شده است و امکان رزرو نوبت وجود ندارد.</p>';
      return;
    }
    data.slots.forEach(slot=>{
      const b=document.createElement("button");
      b.type="button";
      b.className="slot";
      b.textContent=slot.time;
      b.disabled=slot.booked;
      if(slot.booked) b.title="این زمان قبلاً رزرو شده است";
      b.addEventListener("click",()=>{
        document.querySelectorAll(".slot").forEach(x=>x.classList.remove("selected"));
        b.classList.add("selected");
        selectedTime.value=slot.time;
      });
      slotsBox.appendChild(b);
    });
  }catch{
    slotsBox.innerHTML='<p class="muted">اتصال به سامانه نوبت‌دهی برقرار نشد. ابتدا Backend را اجرا کنید.</p>';
  }
}

appointmentForm.addEventListener("submit",async e=>{
  e.preventDefault();
  message.className="form-message";
  message.textContent="";
  if(!phoneVerified){
    message.classList.add("error");
    message.textContent="لطفاً ابتدا شماره موبایل خود را با کد پیامکی تأیید کنید.";
    return;
  }
  if(!dateInput.value){
    message.classList.add("error");
    message.textContent="لطفاً تاریخ نوبت را به شمسی انتخاب کنید.";
    return;
  }
  if(!selectedTime.value){
    message.classList.add("error");
    message.textContent="لطفاً ابتدا یکی از ساعت‌های آزاد را انتخاب کنید.";
    return;
  }
  const payload={
    date:dateInput.value,
    time:selectedTime.value,
    name:document.getElementById("name").value.trim(),
    phone:document.getElementById("phone").value.trim(),
    note:document.getElementById("note").value.trim()
  };
  try{
    const res=await fetch(`${API}/appointments`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(payload)
    });
    const data=await res.json();
    if(!res.ok) throw new Error(data.message||"خطا در ثبت نوبت");
    message.classList.add("success");
    message.textContent=`نوبت شما برای ${dateDisplay.value} ساعت ${payload.time} با موفقیت ثبت شد.`;
    appointmentForm.reset();
    resetPhoneVerification();
    dateDisplay.value="";
    dateInput.value="";
    selectedTime.value="";
    await loadSlots();
  }catch(err){
    message.classList.add("error");
    message.textContent=err.message||"ثبت نوبت انجام نشد.";
    await loadSlots();
  }
});

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{
  if(e.isIntersecting){
    e.target.classList.add("show");
    observer.unobserve(e.target);
  }
}),{threshold:.08});
document.querySelectorAll(".reveal").forEach(el=>observer.observe(el));

renderCalendar();
