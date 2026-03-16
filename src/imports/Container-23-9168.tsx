function Button() {
  return (
    <div className="absolute bg-white h-[31.982px] left-[2px] rounded-[21243700px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] top-[2px] w-[77.22px]" data-name="button">
      <p className="-translate-x-1/2 absolute font-['Inter:Semi_Bold','Noto_Sans_Thai:SemiBold',sans-serif] font-semibold leading-[16px] left-[39.5px] not-italic text-[#498a4f] text-[12px] text-center top-[8.63px]">รายเดือน</p>
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute h-[31.982px] left-[79.22px] rounded-[21243700px] top-[2px] w-[59.048px]" data-name="button">
      <p className="-translate-x-1/2 absolute font-['Inter:Regular','Noto_Sans_Thai:Regular',sans-serif] font-normal leading-[16px] left-[30px] not-italic text-[#6a7282] text-[12px] text-center top-[8.63px]">รายปี</p>
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-[#f3f4f6] relative rounded-[21243700px] size-full" data-name="Container">
      <Button />
      <Button1 />
    </div>
  );
}