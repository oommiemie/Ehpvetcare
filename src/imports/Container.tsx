function Button() {
  return (
    <div className="absolute h-[33.98px] left-[2px] rounded-[21243700px] top-[2px] w-[64.854px]" data-name="button">
      <p className="-translate-x-1/2 absolute font-['Inter:Regular','Noto_Sans_Thai:Regular',sans-serif] font-normal leading-[18px] left-[32px] not-italic text-[#6a7282] text-[12px] text-center top-[8.89px]">รายวัน</p>
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute h-[33.98px] left-[66.85px] rounded-[21243700px] top-[2px] w-[87.706px]" data-name="button">
      <p className="-translate-x-1/2 absolute font-['Inter:Regular','Noto_Sans_Thai:Regular',sans-serif] font-normal leading-[18px] left-[44px] not-italic text-[#6a7282] text-[12px] text-center top-[8.89px]">รายสัปดาห์</p>
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute bg-white h-[33.98px] left-[154.56px] rounded-[21243700px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] top-[2px] w-[77.22px]" data-name="button">
      <p className="-translate-x-1/2 absolute font-['Inter:Semi_Bold','Noto_Sans_Thai:SemiBold',sans-serif] font-semibold leading-[18px] left-[39.5px] not-italic text-[#498a4f] text-[12px] text-center top-[8.89px]">รายเดือน</p>
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-[#f3f4f6] relative rounded-[21243700px] size-full" data-name="Container">
      <Button />
      <Button1 />
      <Button2 />
    </div>
  );
}