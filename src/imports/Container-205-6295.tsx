import svgPaths from "./svg-e8n0va12tr";

function Container2() {
  return <div className="bg-[#19a589] h-[31.992px] rounded-[21243700px] shrink-0 w-[3.997px]" data-name="Container" />;
}

function Icon() {
  return (
    <div className="h-[15.996px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[8.39%]" data-name="Vector">
        <div className="absolute inset-[-5.01%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.6435 14.6435">
            <path d={svgPaths.p1f806300} id="Vector" stroke="var(--stroke-0, #2B7FFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[35.42%]" data-name="Vector">
        <div className="absolute inset-[-14.29%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.99849 5.99849">
            <path d={svgPaths.p1e9a1700} id="Vector" stroke="var(--stroke-0, #2B7FFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 size-[15.996px] top-[2px]" data-name="Text">
      <Icon />
    </div>
  );
}

function Text1() {
  return (
    <div className="absolute h-[19.993px] left-[23.99px] top-0 w-[65.31px]" data-name="Text">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Bold',sans-serif] leading-[20px] left-0 not-italic text-[#1e2939] text-[14px] top-[0.1px] whitespace-nowrap">รายการยา</p>
    </div>
  );
}

function Text2() {
  return (
    <div className="absolute h-[15.996px] left-[97.29px] top-[2px] w-[72.333px]" data-name="Text">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-0 not-italic text-[#99a1af] text-[12px] top-[0.1px] whitespace-nowrap">Drug Registry</p>
    </div>
  );
}

function Container3() {
  return (
    <div className="flex-[1_0_0] h-[19.993px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Text />
        <Text1 />
        <Text2 />
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute left-[12px] size-[13.998px] top-[8.99px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g id="Icon">
          <path d="M2.91619 6.99886H11.0815" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M6.99886 2.91619V11.0815" id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="h-[31.992px] relative rounded-[21243700px] shadow-[0px_2px_10px_0px_rgba(25,165,137,0.3)] shrink-0 w-[83.363px]" data-name="Button" style={{ backgroundImage: "linear-gradient(159.005deg, rgb(25, 165, 137) 0%, rgb(13, 124, 102) 100%)" }}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Icon1 />
        <p className="-translate-x-1/2 absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[18px] left-[50.49px] not-italic text-[12px] text-center text-white top-[6.73px] whitespace-nowrap">{` เพิ่มยา`}</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="bg-[rgba(249,250,251,0.6)] h-[60.621px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-b-[0.633px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[11.999px] items-center pb-[0.633px] px-[23.999px] relative size-full">
          <Container2 />
          <Container3 />
          <Button />
        </div>
      </div>
    </div>
  );
}

function Icon2() {
  return (
    <div className="relative shrink-0 size-[15.996px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.996 15.996">
        <g id="Icon">
          <path d={svgPaths.p1ac02680} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
          <path d={svgPaths.p18cccdc0} id="Vector_2" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.333" />
        </g>
      </svg>
    </div>
  );
}

function TextInput() {
  return (
    <div className="bg-[#f9fafb] flex-[1_0_0] h-[41.241px] min-h-px min-w-px relative rounded-[9999px]" data-name="Text Input">
      <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[10px] items-center px-[12px] py-[10px] relative size-full">
          <Icon2 />
          <p className="font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#d1d5db] text-[14px] whitespace-nowrap">ค้นหาชื่อยา / รหัสยา...</p>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[9999px]" />
    </div>
  );
}

function Container4() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-b-[0.633px] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center p-[16px] relative w-full">
          <TextInput />
        </div>
      </div>
    </div>
  );
}

function HeaderCell() {
  return (
    <div className="absolute h-[40.311px] left-0 top-0 w-[61.085px]" data-name="Header Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[16px] left-[12px] not-italic text-[#6a7282] text-[12px] top-[12.1px] whitespace-nowrap">รหัสยา</p>
    </div>
  );
}

function HeaderCell1() {
  return (
    <div className="absolute h-[40.311px] left-[61.09px] top-0 w-[173.938px]" data-name="Header Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[16px] left-[12px] not-italic text-[#6a7282] text-[12px] top-[12.1px] whitespace-nowrap">ชื่อยา</p>
    </div>
  );
}

function HeaderCell2() {
  return (
    <div className="absolute h-[40.311px] left-[235.02px] top-0 w-[100.803px]" data-name="Header Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[16px] left-[12px] not-italic text-[#6a7282] text-[12px] top-[12.1px] whitespace-nowrap">ชื่อสามัญ</p>
    </div>
  );
}

function HeaderCell3() {
  return (
    <div className="absolute h-[40.311px] left-[335.83px] top-0 w-[76.557px]" data-name="Header Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[16px] left-[12px] not-italic text-[#6a7282] text-[12px] top-[12.1px] whitespace-nowrap">หมวดหมู่</p>
    </div>
  );
}

function HeaderCell4() {
  return (
    <div className="absolute h-[40.311px] left-[412.38px] top-0 w-[63.549px]" data-name="Header Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[16px] left-[12px] not-italic text-[#6a7282] text-[12px] top-[12.1px] whitespace-nowrap">หน่วย</p>
    </div>
  );
}

function HeaderCell5() {
  return (
    <div className="absolute h-[40.311px] left-[475.93px] top-0 w-[68.98px]" data-name="Header Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[16px] left-[12px] not-italic text-[#6a7282] text-[12px] top-[12.1px] whitespace-nowrap">ราคาทุน</p>
    </div>
  );
}

function HeaderCell6() {
  return (
    <div className="absolute h-[40.311px] left-[544.91px] top-0 w-[73.599px]" data-name="Header Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[16px] left-[12px] not-italic text-[#6a7282] text-[12px] top-[12.1px] whitespace-nowrap">ราคาขาย</p>
    </div>
  );
}

function HeaderCell7() {
  return (
    <div className="absolute h-[40.311px] left-[618.51px] top-0 w-[89.793px]" data-name="Header Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[16px] left-[12px] not-italic text-[#6a7282] text-[12px] top-[12.1px] whitespace-nowrap">Stock ขั้นต่ำ</p>
    </div>
  );
}

function HeaderCell8() {
  return (
    <div className="absolute h-[40.311px] left-[708.3px] top-0 w-[61.283px]" data-name="Header Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[16px] left-[12px] not-italic text-[#6a7282] text-[12px] top-[12.1px] whitespace-nowrap">สถานะ</p>
    </div>
  );
}

function HeaderCell9() {
  return (
    <div className="absolute h-[40.311px] left-[769.59px] top-0 w-[83.986px]" data-name="Header Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:SemiBold',sans-serif] leading-[16px] left-[12px] not-italic text-[#6a7282] text-[12px] top-[12.1px] whitespace-nowrap">จัดการ</p>
    </div>
  );
}

function TableRow() {
  return (
    <div className="absolute h-[40.311px] left-0 top-0 w-[853.574px]" data-name="Table Row">
      <HeaderCell />
      <HeaderCell1 />
      <HeaderCell2 />
      <HeaderCell3 />
      <HeaderCell4 />
      <HeaderCell5 />
      <HeaderCell6 />
      <HeaderCell7 />
      <HeaderCell8 />
      <HeaderCell9 />
    </div>
  );
}

function TableHeader() {
  return (
    <div className="absolute bg-[#f9fafb] border-[#f3f4f6] border-b-[0.633px] border-solid h-[40.311px] left-0 top-0 w-[853.574px]" data-name="Table Header">
      <TableRow />
    </div>
  );
}

function TableCell() {
  return (
    <div className="absolute h-[80.593px] left-0 top-0 w-[61.085px]" data-name="Table Cell">
      <p className="absolute font-['Menlo:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#99a1af] text-[12px] top-[31.93px] whitespace-nowrap">D001</p>
    </div>
  );
}

function TableCell1() {
  return (
    <div className="absolute h-[80.593px] left-[61.09px] top-0 w-[173.938px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[20px] left-[12px] not-italic text-[#1e2939] text-[14px] top-[30.4px] whitespace-nowrap">อะม็อกซิซิลลิน 250mg</p>
    </div>
  );
}

function TableCell2() {
  return (
    <div className="absolute h-[80.593px] left-[235.02px] top-0 w-[100.803px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#99a1af] text-[12px] top-[32.4px] whitespace-nowrap">Amoxicillin</p>
    </div>
  );
}

function Text3() {
  return (
    <div className="absolute bg-[#eff6ff] h-[43.616px] left-[12px] rounded-[21243700px] top-[18.93px] w-[52.558px]" data-name="Text">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-0 not-italic text-[#155dfc] text-[12px] top-[4px] w-[45px]">ยาปฏิชีวนะ</p>
    </div>
  );
}

function TableCell3() {
  return (
    <div className="absolute h-[80.593px] left-[335.83px] top-0 w-[76.557px]" data-name="Table Cell">
      <Text3 />
    </div>
  );
}

function TableCell4() {
  return (
    <div className="absolute h-[80.593px] left-[412.38px] top-0 w-[63.549px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#6a7282] text-[12px] top-[32.4px] whitespace-nowrap">แผง</p>
    </div>
  );
}

function TableCell5() {
  return (
    <div className="absolute h-[80.593px] left-[475.93px] top-0 w-[68.98px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#4a5565] text-[12px] top-[32.4px] whitespace-nowrap">฿85</p>
    </div>
  );
}

function TableCell6() {
  return (
    <div className="absolute h-[80.593px] left-[544.91px] top-0 w-[73.599px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16px] left-[12px] not-italic text-[#1e2939] text-[12px] top-[32.4px] whitespace-nowrap">฿120</p>
    </div>
  );
}

function TableCell7() {
  return (
    <div className="absolute h-[80.593px] left-[618.51px] top-0 w-[89.793px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#6a7282] text-[12px] top-[32.4px] whitespace-nowrap">10 แผง</p>
    </div>
  );
}

function StatusBadge() {
  return (
    <div className="absolute bg-[rgba(25,165,137,0.15)] h-[61.709px] left-[12px] rounded-[21243700px] top-[10.21px] w-[27.58px]" data-name="StatusBadge">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[15.714px] left-0 not-italic text-[#0d7c66] text-[11px] top-[3px] w-[28px]">เปิดใช้งาน</p>
    </div>
  );
}

function TableCell8() {
  return (
    <div className="absolute h-[80.593px] left-[708.3px] top-0 w-[61.283px]" data-name="Table Cell">
      <StatusBadge />
    </div>
  );
}

function Icon3() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_205_6301)" id="Icon">
          <path d={svgPaths.pde93600} id="Vector" stroke="var(--stroke-0, #2B7FFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_205_6301">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button1() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[27.995px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[6.994px] pr-[7.004px] relative size-full">
        <Icon3 />
      </div>
    </div>
  );
}

function Icon4() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_205_6306)" id="Icon">
          <path d="M1.74972 3.49943H12.248" id="Vector" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p3d2fc400} id="Vector_2" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p2f14a000} id="Vector_3" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M5.83238 6.41562V9.91505" id="Vector_4" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M8.16534 6.41562V9.91505" id="Vector_5" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_205_6306">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button2() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[27.995px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[6.994px] pr-[7.004px] relative size-full">
        <Icon4 />
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute content-stretch flex gap-[3.996px] h-[27.995px] items-start left-[12px] top-[26.29px] w-[59.987px]" data-name="Container">
      <Button1 />
      <Button2 />
    </div>
  );
}

function TableCell9() {
  return (
    <div className="absolute h-[80.593px] left-[769.59px] top-0 w-[83.986px]" data-name="Table Cell">
      <Container6 />
    </div>
  );
}

function TableRow1() {
  return (
    <div className="absolute border-[#f9fafb] border-b-[0.633px] border-solid h-[80.593px] left-0 top-0 w-[853.574px]" data-name="Table Row">
      <TableCell />
      <TableCell1 />
      <TableCell2 />
      <TableCell3 />
      <TableCell4 />
      <TableCell5 />
      <TableCell6 />
      <TableCell7 />
      <TableCell8 />
      <TableCell9 />
    </div>
  );
}

function TableCell10() {
  return (
    <div className="absolute h-[80.593px] left-0 top-0 w-[61.085px]" data-name="Table Cell">
      <p className="absolute font-['Menlo:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#99a1af] text-[12px] top-[31.93px] whitespace-nowrap">D002</p>
    </div>
  );
}

function TableCell11() {
  return (
    <div className="absolute h-[80.593px] left-[61.09px] top-0 w-[173.938px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[20px] left-[12px] not-italic text-[#1e2939] text-[14px] top-[30.4px] whitespace-nowrap">เพรดนิโซโลน 5mg</p>
    </div>
  );
}

function TableCell12() {
  return (
    <div className="absolute h-[80.593px] left-[235.02px] top-0 w-[100.803px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#99a1af] text-[12px] top-[32.4px] whitespace-nowrap">Prednisolone</p>
    </div>
  );
}

function Text4() {
  return (
    <div className="absolute bg-[#eff6ff] h-[43.616px] left-[12px] rounded-[21243700px] top-[18.93px] w-[38.343px]" data-name="Text">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-0 not-italic text-[#155dfc] text-[12px] top-[4px] w-[36px]">สเตียรอยด์</p>
    </div>
  );
}

function TableCell13() {
  return (
    <div className="absolute h-[80.593px] left-[335.83px] top-0 w-[76.557px]" data-name="Table Cell">
      <Text4 />
    </div>
  );
}

function TableCell14() {
  return (
    <div className="absolute h-[80.593px] left-[412.38px] top-0 w-[63.549px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#6a7282] text-[12px] top-[32.4px] whitespace-nowrap">แผง</p>
    </div>
  );
}

function TableCell15() {
  return (
    <div className="absolute h-[80.593px] left-[475.93px] top-0 w-[68.98px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#4a5565] text-[12px] top-[32.4px] whitespace-nowrap">฿55</p>
    </div>
  );
}

function TableCell16() {
  return (
    <div className="absolute h-[80.593px] left-[544.91px] top-0 w-[73.599px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16px] left-[12px] not-italic text-[#1e2939] text-[12px] top-[32.4px] whitespace-nowrap">฿80</p>
    </div>
  );
}

function TableCell17() {
  return (
    <div className="absolute h-[80.593px] left-[618.51px] top-0 w-[89.793px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#6a7282] text-[12px] top-[32.4px] whitespace-nowrap">5 แผง</p>
    </div>
  );
}

function StatusBadge1() {
  return (
    <div className="absolute bg-[rgba(25,165,137,0.15)] h-[61.709px] left-[12px] rounded-[21243700px] top-[10.21px] w-[27.58px]" data-name="StatusBadge">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[15.714px] left-0 not-italic text-[#0d7c66] text-[11px] top-[3px] w-[28px]">เปิดใช้งาน</p>
    </div>
  );
}

function TableCell18() {
  return (
    <div className="absolute h-[80.593px] left-[708.3px] top-0 w-[61.283px]" data-name="Table Cell">
      <StatusBadge1 />
    </div>
  );
}

function Icon5() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_205_6301)" id="Icon">
          <path d={svgPaths.pde93600} id="Vector" stroke="var(--stroke-0, #2B7FFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_205_6301">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button3() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[27.995px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[6.994px] pr-[7.004px] relative size-full">
        <Icon5 />
      </div>
    </div>
  );
}

function Icon6() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_205_6306)" id="Icon">
          <path d="M1.74972 3.49943H12.248" id="Vector" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p3d2fc400} id="Vector_2" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p2f14a000} id="Vector_3" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M5.83238 6.41562V9.91505" id="Vector_4" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M8.16534 6.41562V9.91505" id="Vector_5" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_205_6306">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button4() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[27.995px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[6.994px] pr-[7.004px] relative size-full">
        <Icon6 />
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute content-stretch flex gap-[3.996px] h-[27.995px] items-start left-[12px] top-[26.29px] w-[59.987px]" data-name="Container">
      <Button3 />
      <Button4 />
    </div>
  );
}

function TableCell19() {
  return (
    <div className="absolute h-[80.593px] left-[769.59px] top-0 w-[83.986px]" data-name="Table Cell">
      <Container7 />
    </div>
  );
}

function TableRow2() {
  return (
    <div className="absolute border-[#f9fafb] border-b-[0.633px] border-solid h-[80.593px] left-0 top-[80.59px] w-[853.574px]" data-name="Table Row">
      <TableCell10 />
      <TableCell11 />
      <TableCell12 />
      <TableCell13 />
      <TableCell14 />
      <TableCell15 />
      <TableCell16 />
      <TableCell17 />
      <TableCell18 />
      <TableCell19 />
    </div>
  );
}

function TableCell20() {
  return (
    <div className="absolute h-[80.593px] left-0 top-0 w-[61.085px]" data-name="Table Cell">
      <p className="absolute font-['Menlo:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#99a1af] text-[12px] top-[31.93px] whitespace-nowrap">D003</p>
    </div>
  );
}

function TableCell21() {
  return (
    <div className="absolute h-[80.593px] left-[61.09px] top-0 w-[173.938px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[20px] left-[12px] not-italic text-[#1e2939] text-[14px] top-[30.4px] whitespace-nowrap">เมโทรนิดาโซล 200mg</p>
    </div>
  );
}

function TableCell22() {
  return (
    <div className="absolute h-[80.593px] left-[235.02px] top-0 w-[100.803px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#99a1af] text-[12px] top-[32.4px] whitespace-nowrap">Metronidazole</p>
    </div>
  );
}

function Text5() {
  return (
    <div className="absolute bg-[#eff6ff] h-[43.616px] left-[12px] rounded-[21243700px] top-[18.93px] w-[52.558px]" data-name="Text">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-0 not-italic text-[#155dfc] text-[12px] top-[4px] w-[45px]">ยาปฏิชีวนะ</p>
    </div>
  );
}

function TableCell23() {
  return (
    <div className="absolute h-[80.593px] left-[335.83px] top-0 w-[76.557px]" data-name="Table Cell">
      <Text5 />
    </div>
  );
}

function TableCell24() {
  return (
    <div className="absolute h-[80.593px] left-[412.38px] top-0 w-[63.549px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#6a7282] text-[12px] top-[32.4px] whitespace-nowrap">แผง</p>
    </div>
  );
}

function TableCell25() {
  return (
    <div className="absolute h-[80.593px] left-[475.93px] top-0 w-[68.98px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#4a5565] text-[12px] top-[32.4px] whitespace-nowrap">฿60</p>
    </div>
  );
}

function TableCell26() {
  return (
    <div className="absolute h-[80.593px] left-[544.91px] top-0 w-[73.599px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16px] left-[12px] not-italic text-[#1e2939] text-[12px] top-[32.4px] whitespace-nowrap">฿90</p>
    </div>
  );
}

function TableCell27() {
  return (
    <div className="absolute h-[80.593px] left-[618.51px] top-0 w-[89.793px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#6a7282] text-[12px] top-[32.4px] whitespace-nowrap">10 แผง</p>
    </div>
  );
}

function StatusBadge2() {
  return (
    <div className="absolute bg-[rgba(25,165,137,0.15)] h-[61.709px] left-[12px] rounded-[21243700px] top-[10.21px] w-[27.58px]" data-name="StatusBadge">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[15.714px] left-0 not-italic text-[#0d7c66] text-[11px] top-[3px] w-[28px]">เปิดใช้งาน</p>
    </div>
  );
}

function TableCell28() {
  return (
    <div className="absolute h-[80.593px] left-[708.3px] top-0 w-[61.283px]" data-name="Table Cell">
      <StatusBadge2 />
    </div>
  );
}

function Icon7() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_205_6301)" id="Icon">
          <path d={svgPaths.pde93600} id="Vector" stroke="var(--stroke-0, #2B7FFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_205_6301">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button5() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[27.995px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[6.994px] pr-[7.004px] relative size-full">
        <Icon7 />
      </div>
    </div>
  );
}

function Icon8() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_205_6306)" id="Icon">
          <path d="M1.74972 3.49943H12.248" id="Vector" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p3d2fc400} id="Vector_2" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p2f14a000} id="Vector_3" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M5.83238 6.41562V9.91505" id="Vector_4" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M8.16534 6.41562V9.91505" id="Vector_5" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_205_6306">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button6() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[27.995px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[6.994px] pr-[7.004px] relative size-full">
        <Icon8 />
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute content-stretch flex gap-[3.996px] h-[27.995px] items-start left-[12px] top-[26.29px] w-[59.987px]" data-name="Container">
      <Button5 />
      <Button6 />
    </div>
  );
}

function TableCell29() {
  return (
    <div className="absolute h-[80.593px] left-[769.59px] top-0 w-[83.986px]" data-name="Table Cell">
      <Container8 />
    </div>
  );
}

function TableRow3() {
  return (
    <div className="absolute border-[#f9fafb] border-b-[0.633px] border-solid h-[80.593px] left-0 top-[161.19px] w-[853.574px]" data-name="Table Row">
      <TableCell20 />
      <TableCell21 />
      <TableCell22 />
      <TableCell23 />
      <TableCell24 />
      <TableCell25 />
      <TableCell26 />
      <TableCell27 />
      <TableCell28 />
      <TableCell29 />
    </div>
  );
}

function TableCell30() {
  return (
    <div className="absolute h-[80.593px] left-0 top-0 w-[61.085px]" data-name="Table Cell">
      <p className="absolute font-['Menlo:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#99a1af] text-[12px] top-[31.93px] whitespace-nowrap">D004</p>
    </div>
  );
}

function TableCell31() {
  return (
    <div className="absolute h-[80.593px] left-[61.09px] top-0 w-[173.938px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[20px] left-[12px] not-italic text-[#1e2939] text-[14px] top-[30.4px] whitespace-nowrap">ด็อกซีไซคลิน 100mg</p>
    </div>
  );
}

function TableCell32() {
  return (
    <div className="absolute h-[80.593px] left-[235.02px] top-0 w-[100.803px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#99a1af] text-[12px] top-[32.4px] whitespace-nowrap">Doxycycline</p>
    </div>
  );
}

function Text6() {
  return (
    <div className="absolute bg-[#eff6ff] h-[43.616px] left-[12px] rounded-[21243700px] top-[18.93px] w-[52.558px]" data-name="Text">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-0 not-italic text-[#155dfc] text-[12px] top-[4px] w-[45px]">ยาปฏิชีวนะ</p>
    </div>
  );
}

function TableCell33() {
  return (
    <div className="absolute h-[80.593px] left-[335.83px] top-0 w-[76.557px]" data-name="Table Cell">
      <Text6 />
    </div>
  );
}

function TableCell34() {
  return (
    <div className="absolute h-[80.593px] left-[412.38px] top-0 w-[63.549px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#6a7282] text-[12px] top-[32.4px] whitespace-nowrap">แคปซูล</p>
    </div>
  );
}

function TableCell35() {
  return (
    <div className="absolute h-[80.593px] left-[475.93px] top-0 w-[68.98px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#4a5565] text-[12px] top-[32.4px] whitespace-nowrap">฿140</p>
    </div>
  );
}

function TableCell36() {
  return (
    <div className="absolute h-[80.593px] left-[544.91px] top-0 w-[73.599px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16px] left-[12px] not-italic text-[#1e2939] text-[12px] top-[32.4px] whitespace-nowrap">฿200</p>
    </div>
  );
}

function TableCell37() {
  return (
    <div className="absolute h-[80.593px] left-[618.51px] top-0 w-[89.793px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#6a7282] text-[12px] top-[32.4px] whitespace-nowrap">20 แคปซูล</p>
    </div>
  );
}

function StatusBadge3() {
  return (
    <div className="absolute bg-[rgba(25,165,137,0.15)] h-[61.709px] left-[12px] rounded-[21243700px] top-[10.21px] w-[27.58px]" data-name="StatusBadge">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[15.714px] left-0 not-italic text-[#0d7c66] text-[11px] top-[3px] w-[28px]">เปิดใช้งาน</p>
    </div>
  );
}

function TableCell38() {
  return (
    <div className="absolute h-[80.593px] left-[708.3px] top-0 w-[61.283px]" data-name="Table Cell">
      <StatusBadge3 />
    </div>
  );
}

function Icon9() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_205_6301)" id="Icon">
          <path d={svgPaths.pde93600} id="Vector" stroke="var(--stroke-0, #2B7FFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_205_6301">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button7() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[27.995px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[6.994px] pr-[7.004px] relative size-full">
        <Icon9 />
      </div>
    </div>
  );
}

function Icon10() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_205_6306)" id="Icon">
          <path d="M1.74972 3.49943H12.248" id="Vector" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p3d2fc400} id="Vector_2" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p2f14a000} id="Vector_3" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M5.83238 6.41562V9.91505" id="Vector_4" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M8.16534 6.41562V9.91505" id="Vector_5" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_205_6306">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button8() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[27.995px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[6.994px] pr-[7.004px] relative size-full">
        <Icon10 />
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute content-stretch flex gap-[3.996px] h-[27.995px] items-start left-[12px] top-[26.29px] w-[59.987px]" data-name="Container">
      <Button7 />
      <Button8 />
    </div>
  );
}

function TableCell39() {
  return (
    <div className="absolute h-[80.593px] left-[769.59px] top-0 w-[83.986px]" data-name="Table Cell">
      <Container9 />
    </div>
  );
}

function TableRow4() {
  return (
    <div className="absolute border-[#f9fafb] border-b-[0.633px] border-solid h-[80.593px] left-0 top-[241.78px] w-[853.574px]" data-name="Table Row">
      <TableCell30 />
      <TableCell31 />
      <TableCell32 />
      <TableCell33 />
      <TableCell34 />
      <TableCell35 />
      <TableCell36 />
      <TableCell37 />
      <TableCell38 />
      <TableCell39 />
    </div>
  );
}

function TableCell40() {
  return (
    <div className="absolute h-[80.593px] left-0 top-0 w-[61.085px]" data-name="Table Cell">
      <p className="absolute font-['Menlo:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#99a1af] text-[12px] top-[31.93px] whitespace-nowrap">D005</p>
    </div>
  );
}

function TableCell41() {
  return (
    <div className="absolute h-[80.593px] left-[61.09px] top-0 w-[173.938px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[20px] left-[12px] not-italic text-[#1e2939] text-[14px] top-[30.4px] whitespace-nowrap">เมล็อกซิแคม 1mg/ml</p>
    </div>
  );
}

function TableCell42() {
  return (
    <div className="absolute h-[80.593px] left-[235.02px] top-0 w-[100.803px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#99a1af] text-[12px] top-[32.4px] whitespace-nowrap">Meloxicam</p>
    </div>
  );
}

function Text7() {
  return (
    <div className="absolute bg-[#eff6ff] h-[63.608px] left-[12px] rounded-[21243700px] top-[8.94px] w-[43.991px]" data-name="Text">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-0 not-italic text-[#155dfc] text-[12px] top-[4px] w-[37px]">ยาแก้ปวด NSAID</p>
    </div>
  );
}

function TableCell43() {
  return (
    <div className="absolute h-[80.593px] left-[335.83px] top-0 w-[76.557px]" data-name="Table Cell">
      <Text7 />
    </div>
  );
}

function TableCell44() {
  return (
    <div className="absolute h-[80.593px] left-[412.38px] top-0 w-[63.549px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#6a7282] text-[12px] top-[32.4px] whitespace-nowrap">ขวด</p>
    </div>
  );
}

function TableCell45() {
  return (
    <div className="absolute h-[80.593px] left-[475.93px] top-0 w-[68.98px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#4a5565] text-[12px] top-[32.4px] whitespace-nowrap">฿250</p>
    </div>
  );
}

function TableCell46() {
  return (
    <div className="absolute h-[80.593px] left-[544.91px] top-0 w-[73.599px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16px] left-[12px] not-italic text-[#1e2939] text-[12px] top-[32.4px] whitespace-nowrap">฿350</p>
    </div>
  );
}

function TableCell47() {
  return (
    <div className="absolute h-[80.593px] left-[618.51px] top-0 w-[89.793px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#6a7282] text-[12px] top-[32.4px] whitespace-nowrap">5 ขวด</p>
    </div>
  );
}

function StatusBadge4() {
  return (
    <div className="absolute bg-[rgba(25,165,137,0.15)] h-[61.709px] left-[12px] rounded-[21243700px] top-[10.21px] w-[27.58px]" data-name="StatusBadge">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[15.714px] left-0 not-italic text-[#0d7c66] text-[11px] top-[3px] w-[28px]">เปิดใช้งาน</p>
    </div>
  );
}

function TableCell48() {
  return (
    <div className="absolute h-[80.593px] left-[708.3px] top-0 w-[61.283px]" data-name="Table Cell">
      <StatusBadge4 />
    </div>
  );
}

function Icon11() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_205_6301)" id="Icon">
          <path d={svgPaths.pde93600} id="Vector" stroke="var(--stroke-0, #2B7FFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_205_6301">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button9() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[27.995px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[6.994px] pr-[7.004px] relative size-full">
        <Icon11 />
      </div>
    </div>
  );
}

function Icon12() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_205_6306)" id="Icon">
          <path d="M1.74972 3.49943H12.248" id="Vector" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p3d2fc400} id="Vector_2" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p2f14a000} id="Vector_3" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M5.83238 6.41562V9.91505" id="Vector_4" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M8.16534 6.41562V9.91505" id="Vector_5" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_205_6306">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button10() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[27.995px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[6.994px] pr-[7.004px] relative size-full">
        <Icon12 />
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute content-stretch flex gap-[3.996px] h-[27.995px] items-start left-[12px] top-[26.29px] w-[59.987px]" data-name="Container">
      <Button9 />
      <Button10 />
    </div>
  );
}

function TableCell49() {
  return (
    <div className="absolute h-[80.593px] left-[769.59px] top-0 w-[83.986px]" data-name="Table Cell">
      <Container10 />
    </div>
  );
}

function TableRow5() {
  return (
    <div className="absolute border-[#f9fafb] border-b-[0.633px] border-solid h-[80.593px] left-0 top-[322.37px] w-[853.574px]" data-name="Table Row">
      <TableCell40 />
      <TableCell41 />
      <TableCell42 />
      <TableCell43 />
      <TableCell44 />
      <TableCell45 />
      <TableCell46 />
      <TableCell47 />
      <TableCell48 />
      <TableCell49 />
    </div>
  );
}

function TableCell50() {
  return (
    <div className="absolute h-[80.593px] left-0 top-0 w-[61.085px]" data-name="Table Cell">
      <p className="absolute font-['Menlo:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#99a1af] text-[12px] top-[31.93px] whitespace-nowrap">D006</p>
    </div>
  );
}

function TableCell51() {
  return (
    <div className="absolute h-[80.593px] left-[61.09px] top-0 w-[173.938px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[20px] left-[12px] not-italic text-[#1e2939] text-[14px] top-[30.4px] whitespace-nowrap">ฟูโรเซไมด์ 40mg</p>
    </div>
  );
}

function TableCell52() {
  return (
    <div className="absolute h-[80.593px] left-[235.02px] top-0 w-[100.803px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#99a1af] text-[12px] top-[32.4px] whitespace-nowrap">Furosemide</p>
    </div>
  );
}

function Text8() {
  return (
    <div className="absolute bg-[#eff6ff] h-[43.616px] left-[12px] rounded-[21243700px] top-[18.93px] w-[49.234px]" data-name="Text">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-0 not-italic text-[#155dfc] text-[12px] top-[4px] w-[42px]">ยาขับปัสสาวะ</p>
    </div>
  );
}

function TableCell53() {
  return (
    <div className="absolute h-[80.593px] left-[335.83px] top-0 w-[76.557px]" data-name="Table Cell">
      <Text8 />
    </div>
  );
}

function TableCell54() {
  return (
    <div className="absolute h-[80.593px] left-[412.38px] top-0 w-[63.549px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#6a7282] text-[12px] top-[32.4px] whitespace-nowrap">แผง</p>
    </div>
  );
}

function TableCell55() {
  return (
    <div className="absolute h-[80.593px] left-[475.93px] top-0 w-[68.98px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#4a5565] text-[12px] top-[32.4px] whitespace-nowrap">฿40</p>
    </div>
  );
}

function TableCell56() {
  return (
    <div className="absolute h-[80.593px] left-[544.91px] top-0 w-[73.599px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16px] left-[12px] not-italic text-[#1e2939] text-[12px] top-[32.4px] whitespace-nowrap">฿60</p>
    </div>
  );
}

function TableCell57() {
  return (
    <div className="absolute h-[80.593px] left-[618.51px] top-0 w-[89.793px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#6a7282] text-[12px] top-[32.4px] whitespace-nowrap">10 แผง</p>
    </div>
  );
}

function StatusBadge5() {
  return (
    <div className="absolute bg-[rgba(25,165,137,0.15)] h-[61.709px] left-[12px] rounded-[21243700px] top-[10.21px] w-[27.58px]" data-name="StatusBadge">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[15.714px] left-0 not-italic text-[#0d7c66] text-[11px] top-[3px] w-[28px]">เปิดใช้งาน</p>
    </div>
  );
}

function TableCell58() {
  return (
    <div className="absolute h-[80.593px] left-[708.3px] top-0 w-[61.283px]" data-name="Table Cell">
      <StatusBadge5 />
    </div>
  );
}

function Icon13() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_205_6301)" id="Icon">
          <path d={svgPaths.pde93600} id="Vector" stroke="var(--stroke-0, #2B7FFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_205_6301">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button11() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[27.995px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[6.994px] pr-[7.004px] relative size-full">
        <Icon13 />
      </div>
    </div>
  );
}

function Icon14() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_205_6306)" id="Icon">
          <path d="M1.74972 3.49943H12.248" id="Vector" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p3d2fc400} id="Vector_2" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p2f14a000} id="Vector_3" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M5.83238 6.41562V9.91505" id="Vector_4" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M8.16534 6.41562V9.91505" id="Vector_5" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_205_6306">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button12() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[27.995px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[6.994px] pr-[7.004px] relative size-full">
        <Icon14 />
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="absolute content-stretch flex gap-[3.996px] h-[27.995px] items-start left-[12px] top-[26.29px] w-[59.987px]" data-name="Container">
      <Button11 />
      <Button12 />
    </div>
  );
}

function TableCell59() {
  return (
    <div className="absolute h-[80.593px] left-[769.59px] top-0 w-[83.986px]" data-name="Table Cell">
      <Container11 />
    </div>
  );
}

function TableRow6() {
  return (
    <div className="absolute border-[#f9fafb] border-b-[0.633px] border-solid h-[80.593px] left-0 top-[402.97px] w-[853.574px]" data-name="Table Row">
      <TableCell50 />
      <TableCell51 />
      <TableCell52 />
      <TableCell53 />
      <TableCell54 />
      <TableCell55 />
      <TableCell56 />
      <TableCell57 />
      <TableCell58 />
      <TableCell59 />
    </div>
  );
}

function TableCell60() {
  return (
    <div className="absolute h-[60.284px] left-0 top-0 w-[61.085px]" data-name="Table Cell">
      <p className="absolute font-['Menlo:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#99a1af] text-[12px] top-[21.93px] whitespace-nowrap">D007</p>
    </div>
  );
}

function TableCell61() {
  return (
    <div className="absolute h-[60.284px] left-[61.09px] top-0 w-[173.938px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[20px] left-[12px] not-italic text-[#1e2939] text-[14px] top-[20.4px] whitespace-nowrap">เอนโรฟลอกซาซิน 50mg</p>
    </div>
  );
}

function TableCell62() {
  return (
    <div className="absolute h-[60.284px] left-[235.02px] top-0 w-[100.803px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#99a1af] text-[12px] top-[22.4px] whitespace-nowrap">Enrofloxacin</p>
    </div>
  );
}

function Text9() {
  return (
    <div className="absolute bg-[#eff6ff] h-[43.616px] left-[12px] rounded-[21243700px] top-[8.94px] w-[52.558px]" data-name="Text">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-0 not-italic text-[#155dfc] text-[12px] top-[4px] w-[45px]">ยาปฏิชีวนะ</p>
    </div>
  );
}

function TableCell63() {
  return (
    <div className="absolute h-[60.284px] left-[335.83px] top-0 w-[76.557px]" data-name="Table Cell">
      <Text9 />
    </div>
  );
}

function TableCell64() {
  return (
    <div className="absolute h-[60.284px] left-[412.38px] top-0 w-[63.549px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#6a7282] text-[12px] top-[22.4px] whitespace-nowrap">เม็ด</p>
    </div>
  );
}

function TableCell65() {
  return (
    <div className="absolute h-[60.284px] left-[475.93px] top-0 w-[68.98px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#4a5565] text-[12px] top-[22.4px] whitespace-nowrap">฿180</p>
    </div>
  );
}

function TableCell66() {
  return (
    <div className="absolute h-[60.284px] left-[544.91px] top-0 w-[73.599px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[16px] left-[12px] not-italic text-[#1e2939] text-[12px] top-[22.4px] whitespace-nowrap">฿250</p>
    </div>
  );
}

function TableCell67() {
  return (
    <div className="absolute h-[60.284px] left-[618.51px] top-0 w-[89.793px]" data-name="Table Cell">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Regular',sans-serif] leading-[16px] left-[12px] not-italic text-[#6a7282] text-[12px] top-[22.4px] whitespace-nowrap">20 เม็ด</p>
    </div>
  );
}

function StatusBadge6() {
  return (
    <div className="absolute bg-[#f3f4f6] h-[41.716px] left-[12px] rounded-[21243700px] top-[10.21px] w-[34.742px]" data-name="StatusBadge">
      <p className="absolute font-['IBM_Plex_Sans_Thai_Looped:Medium',sans-serif] leading-[15.714px] left-0 not-italic text-[#99a1af] text-[11px] top-[3px] w-[35px]">ปิดใช้งาน</p>
    </div>
  );
}

function TableCell68() {
  return (
    <div className="absolute h-[60.284px] left-[708.3px] top-0 w-[61.283px]" data-name="Table Cell">
      <StatusBadge6 />
    </div>
  );
}

function Icon15() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_205_6301)" id="Icon">
          <path d={svgPaths.pde93600} id="Vector" stroke="var(--stroke-0, #2B7FFF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_205_6301">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button13() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[27.995px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[6.994px] pr-[7.004px] relative size-full">
        <Icon15 />
      </div>
    </div>
  );
}

function Icon16() {
  return (
    <div className="relative shrink-0 size-[13.998px]" data-name="Icon">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9977 13.9977">
        <g clipPath="url(#clip0_205_6306)" id="Icon">
          <path d="M1.74972 3.49943H12.248" id="Vector" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p3d2fc400} id="Vector_2" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d={svgPaths.p2f14a000} id="Vector_3" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M5.83238 6.41562V9.91505" id="Vector_4" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
          <path d="M8.16534 6.41562V9.91505" id="Vector_5" stroke="var(--stroke-0, #FF6467)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16648" />
        </g>
        <defs>
          <clipPath id="clip0_205_6306">
            <rect fill="white" height="13.9977" width="13.9977" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Button14() {
  return (
    <div className="relative rounded-[10px] shrink-0 size-[27.995px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[6.994px] pr-[7.004px] relative size-full">
        <Icon16 />
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="absolute content-stretch flex gap-[3.996px] h-[27.995px] items-start left-[12px] top-[16.3px] w-[59.987px]" data-name="Container">
      <Button13 />
      <Button14 />
    </div>
  );
}

function TableCell69() {
  return (
    <div className="absolute h-[60.284px] left-[769.59px] top-0 w-[83.986px]" data-name="Table Cell">
      <Container12 />
    </div>
  );
}

function TableRow7() {
  return (
    <div className="absolute h-[60.284px] left-0 top-[483.56px] w-[853.574px]" data-name="Table Row">
      <TableCell60 />
      <TableCell61 />
      <TableCell62 />
      <TableCell63 />
      <TableCell64 />
      <TableCell65 />
      <TableCell66 />
      <TableCell67 />
      <TableCell68 />
      <TableCell69 />
    </div>
  );
}

function TableBody() {
  return (
    <div className="absolute h-[543.844px] left-0 top-[40.31px] w-[853.574px]" data-name="Table Body">
      <TableRow1 />
      <TableRow2 />
      <TableRow3 />
      <TableRow4 />
      <TableRow5 />
      <TableRow6 />
      <TableRow7 />
    </div>
  );
}

function Table() {
  return (
    <div className="h-[584.155px] relative shrink-0 w-full" data-name="Table">
      <TableHeader />
      <TableBody />
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col h-[584.155px] items-start overflow-clip pr-[-68.722px] relative shrink-0 w-full" data-name="Container">
      <Table />
    </div>
  );
}

function DrugsSection() {
  return (
    <div className="bg-white h-[659.288px] relative rounded-[16px] shrink-0 w-full" data-name="DrugsSection">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start p-[0.633px] relative size-full">
          <Container1 />
          <Container4 />
          <Container5 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#f3f4f6] border-[0.633px] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

export default function Container() {
  return (
    <div className="content-stretch flex flex-col items-start pt-[23.999px] px-[23.999px] relative size-full" data-name="Container">
      <DrugsSection />
    </div>
  );
}