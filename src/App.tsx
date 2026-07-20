import { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  Lock,
  LogOut,
  Filter,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Search,
  X,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { extractTextFromPdf, parsePdfText } from './utils/pdfParser';
import {
  supabase,
  fetchInitialClientsFromSupabase,
  fetchAllClientsParallelFromSupabase,
  saveRegistrationToSupabase,
  fetchTeamsFromSupabase,
  fetchManagersFromSupabase,
  createTeamInSupabase,
  deleteTeamInSupabase,
  updateManagerTeamInSupabase,
  approveManagerInSupabase,
  deleteManagerInSupabase,
  createManagerInSupabase
} from './utils/supabaseClient';


// Define customer interface
interface Customer {
  id: number;
  registeredDate: string;
  nationality: string;
  name: string;
  birthDate: string;
  visa: string;
  companyName: string;
  refundStatus: string;
  submissionStatus: string;
  monthlyRent: string;
  claimDate: string;
  additionalPerformance: number;
  managerCountry: string;
  managerName: string;
}

// Define manager interface
interface Manager {
  name: string;
  country: string;
  email: string;
  phone: string;
  activeCount: number;
}

// Define Toast interface
interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
}

function App() {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [loginId, setLoginId] = useState<string>('admin');
  const [loginPw, setLoginPw] = useState<string>('');
  const [passwordChangeText, setPasswordChangeText] = useState({ current: '', new: '', confirm: '' });

  // Navigation State: customer = List View, registration = Register/Detail View, staff = Staff View, password = Password View
  const [currentView, setCurrentView] = useState<'customer' | 'registration' | 'staff' | 'password'>('customer');

  // Customer List State
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: 24707,
      registeredDate: '26. 7. 15.',
      nationality: '인도네시아',
      name: 'HASANUDDIN',
      birthDate: '890528-5580013',
      visa: 'E10',
      companyName: '자이코마린주식회사',
      refundStatus: '◎경정상담중',
      submissionStatus: '◎재직회사재출',
      monthlyRent: '아니오',
      claimDate: '-',
      additionalPerformance: 0,
      managerCountry: '인도네시아',
      managerName: 'Gaby',
    },
    {
      id: 24706,
      registeredDate: '26. 7. 15.',
      nationality: '네팔',
      name: 'ACHARYA BISHNU',
      birthDate: '940927-5260047',
      visa: 'E10',
      companyName: '농업회사법인(주)에버그린풍성지',
      refundStatus: '대기',
      submissionStatus: '◎제출이력없음',
      monthlyRent: '아니오',
      claimDate: '-',
      additionalPerformance: 0,
      managerCountry: '네팔',
      managerName: '레누카',
    },
    {
      id: 24705,
      registeredDate: '26. 7. 15.',
      nationality: '네팔',
      name: 'LAPCHA SUMAN',
      birthDate: '960809-5900027',
      visa: '-',
      companyName: '-',
      refundStatus: '◎경정상담중',
      submissionStatus: '◎제출이력없음',
      monthlyRent: '아니오',
      claimDate: '-',
      additionalPerformance: 0,
      managerCountry: '네팔',
      managerName: '레누카',
    },
    {
      id: 24704,
      registeredDate: '26. 7. 15.',
      nationality: '네팔',
      name: 'RAI KRISHNA KUMAR',
      birthDate: '920109-5140509',
      visa: '-',
      companyName: '(주)라임텍',
      refundStatus: '※감면명세서요청중',
      submissionStatus: '◎제출이력없음',
      monthlyRent: '아니오',
      claimDate: '-',
      additionalPerformance: 0,
      managerCountry: '네팔',
      managerName: '레누카',
    },
    {
      id: 24703,
      registeredDate: '26. 7. 15.',
      nationality: '인도네시아',
      name: 'SONHAJI',
      birthDate: '820723-5580014',
      visa: 'E10',
      companyName: '-',
      refundStatus: '◎경정상담중',
      submissionStatus: '◎제출이력없음',
      monthlyRent: '아니오',
      claimDate: '-',
      additionalPerformance: 0,
      managerCountry: '인도네시아',
      managerName: 'Gaby',
    },
    {
      id: 24702,
      registeredDate: '26. 7. 15.',
      nationality: '네팔',
      name: 'GHIMIRE HARI SARAN',
      birthDate: '900327-5180307',
      visa: '-',
      companyName: '(주)낙농산업',
      refundStatus: '♥경정청구완료',
      submissionStatus: '◎제출이력없음',
      monthlyRent: '아니오',
      claimDate: '-',
      additionalPerformance: 0,
      managerCountry: '네팔',
      managerName: '레누카',
    },
    {
      id: 24701,
      registeredDate: '26. 7. 15.',
      nationality: '네팔',
      name: 'CHHETRI ARJUN BAHADUR',
      birthDate: '901214-5760193',
      visa: '-',
      companyName: '서앤디전자-음성공장',
      refundStatus: '세로경정청구중',
      submissionStatus: '◎재직회사재출',
      monthlyRent: '아니오',
      claimDate: '-',
      additionalPerformance: 0,
      managerCountry: '네팔',
      managerName: '레누카',
    },
    {
      id: 24700,
      registeredDate: '26. 7. 15.',
      nationality: '네팔',
      name: 'THAPA JANAK BAHADUR',
      birthDate: '870820-5140106',
      visa: '-',
      companyName: '민성소트',
      refundStatus: '◎경정상담중',
      submissionStatus: '◎이전회사재출',
      monthlyRent: '아니오',
      claimDate: '-',
      additionalPerformance: 0,
      managerCountry: '네팔',
      managerName: '레누카',
    },
    {
      id: 24699,
      registeredDate: '26. 7. 15.',
      nationality: '인도네시아',
      name: 'KHAFIDUMAN',
      birthDate: '980201-5520034',
      visa: 'E10',
      companyName: '신형해수산(이인심)',
      refundStatus: '◎경정상담중',
      submissionStatus: '◎제출이력없음',
      monthlyRent: '아니오',
      claimDate: '-',
      additionalPerformance: 0,
      managerCountry: '인도네시아',
      managerName: 'Gaby',
    },
    {
      id: 24698,
      registeredDate: '26. 7. 15.',
      nationality: '파키스탄',
      name: 'KHAN NABEEL',
      birthDate: '940207-5320028',
      visa: 'E7',
      companyName: '(주)원신 경주외동공장',
      refundStatus: '◎경정상담중',
      submissionStatus: '◎제출이력없음',
      monthlyRent: '아니오',
      claimDate: '-',
      additionalPerformance: 0,
      managerCountry: '파키스탄',
      managerName: '아드난',
    },
  ]);

  // Staff State
  const [managers] = useState<Manager[]>([
    { name: 'Gaby', country: '인도네시아', email: 'gaby@novel-tax.kr', phone: '010-1234-5678', activeCount: 3 },
    { name: '레누카', country: '네팔', email: 'renuka@novel-tax.kr', phone: '010-2345-6789', activeCount: 6 },
    { name: '아드난', country: '파키스탄', email: 'adnan@novel-tax.kr', phone: '010-3456-7890', activeCount: 1 },
    { name: '타리크', country: '방글라데시', email: 'tariq@novel-tax.kr', phone: '010-4567-8901', activeCount: 0 },
    { name: '사비르', country: '우즈베키스탄', email: 'sabir@novel-tax.kr', phone: '010-5678-9012', activeCount: 0 },
  ]);

  // Selected Row IDs (for list view check/delete)
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNationality, setSelectedNationality] = useState<string>('');
  const [selectedRefundStatus, setSelectedRefundStatus] = useState<string>('');
  const [selectedManager, setSelectedManager] = useState<string>('');

  // UI state
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 50;

  // Supabase Staff Management State (Team & Manager)
  const [dbTeams, setDbTeams] = useState<any[]>([]);
  const [dbManagers, setDbManagers] = useState<any[]>([]);
  const [managerPage, setManagerPage] = useState<number>(1);
  const managerItemsPerPage = 10;

  const [isAddManagerModalOpen, setIsAddManagerModalOpen] = useState<boolean>(false);
  const [newManagerData, setNewManagerData] = useState({
    name: '',
    teamId: '',
    phone: '',
    email: '',
    address: '',
    facebookMessenger: ''
  });

  const handleSaveNewManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newManagerData.name.trim()) {
      showToast('매니저 이름을 입력해 주세요.', 'error');
      return;
    }
    if (!newManagerData.teamId) {
      showToast('소속 팀을 선택해 주세요.', 'error');
      return;
    }

    showToast('신규 매니저를 등록하는 중입니다...', 'info');
    const res = await createManagerInSupabase({
      name: newManagerData.name.trim(),
      teamId: Number(newManagerData.teamId),
      phone: newManagerData.phone,
      email: newManagerData.email,
      address: newManagerData.address,
      facebookMessenger: newManagerData.facebookMessenger
    });

    if (res.success) {
      showToast(`${newManagerData.name} 매니저가 성공적으로 등록되었습니다.`, 'success');
      setIsAddManagerModalOpen(false);
      setNewManagerData({ name: '', teamId: '', phone: '', email: '', address: '', facebookMessenger: '' });
      loadStaffData();
    } else {
      showToast(`매니저 등록 실패: ${res.error}`, 'error');
    }
  };

  const loadStaffData = async () => {
    const teams = await fetchTeamsFromSupabase();
    const mgrs = await fetchManagersFromSupabase();
    setDbTeams(teams);
    setDbManagers(mgrs);
  };

  // Team & Manager Handlers
  const handleCreateTeam = async () => {
    const teamName = window.prompt('신규 생성할 팀 이름을 입력하세요 (예: 파키스탄, 베트남팀):');
    if (!teamName || !teamName.trim()) return;

    showToast('팀을 생성하는 중입니다...', 'info');
    const res = await createTeamInSupabase(teamName.trim());
    if (res.success) {
      showToast(`'${teamName}' 팀이 성공적으로 생성되었습니다.`, 'success');
      loadStaffData();
    } else {
      showToast(`팀 생성 실패: ${res.error}`, 'error');
    }
  };

  const handleDeleteTeam = async (teamId: number, teamName: string) => {
    if (!window.confirm(`'${teamName}' 팀을 삭제하시겠습니까?`)) return;

    showToast('팀을 삭제하는 중입니다...', 'info');
    const res = await deleteTeamInSupabase(teamId);
    if (res.success) {
      showToast(`'${teamName}' 팀이 삭제되었습니다.`, 'info');
      loadStaffData();
    } else {
      showToast(`팀 삭제 실패: ${res.error}`, 'error');
    }
  };

  const handleUpdateManagerTeam = async (managerId: string, newTeamId: number) => {
    const res = await updateManagerTeamInSupabase(managerId, newTeamId);
    if (res.success) {
      showToast('매니저 소속 팀이 업데이트되었습니다.', 'success');
      setDbManagers(prev => prev.map(m => m.id === managerId ? { ...m, teamId: newTeamId } : m));
    } else {
      showToast(`팀 변경 실패: ${res.error}`, 'error');
    }
  };

  const handleApproveManager = async (managerId: string, managerName: string) => {
    const res = await approveManagerInSupabase(managerId);
    if (res.success) {
      showToast(`${managerName} 매니저 가입이 승인되었습니다.`, 'success');
      setDbManagers(prev => prev.map(m => m.id === managerId ? { ...m, isConfirmed: true } : m));
    } else {
      showToast(`가입 승인 실패: ${res.error}`, 'error');
    }
  };

  const handleDeleteManager = async (managerId: string, managerName: string) => {
    if (!window.confirm(`${managerName} 매니저를 삭제하시겠습니까?`)) return;

    const res = await deleteManagerInSupabase(managerId);
    if (res.success) {
      showToast(`${managerName} 매니저 정보가 삭제되었습니다.`, 'info');
      setDbManagers(prev => prev.filter(m => m.id !== managerId));
    } else {
      showToast(`매니저 삭제 실패: ${res.error}`, 'error');
    }
  };

  const formatKoreanDateTime = (isoString: string) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? '오후' : '오전';
    hours = hours % 12 || 12;
    return `${year}년 ${month}월 ${day}일 ${ampm} ${hours}:${minutes}`;
  };

  // Load Supabase initial data with ultra-fast 2-stage parallel streaming
  useEffect(() => {
    loadStaffData();
    async function loadSupabaseData() {
      try {
        // Stage 1: Ultra-fast initial load (first 2,000 recent items in ~0.2s)
        const initialClients = await fetchInitialClientsFromSupabase();
        if (initialClients && initialClients.length > 0) {
          const mappedInitial: Customer[] = initialClients.map((c: any, idx: number) => {
            const registeredDate = c.createdAt
              ? new Date(c.createdAt).toLocaleDateString('ko-KR', { year: '2-digit', month: 'numeric', day: 'numeric' })
              : '26. 7. 15.';

            return {
              id: c.serial || (25000 + idx),
              registeredDate,
              nationality: c.country || '인도네시아',
              name: c.name || '미상',
              birthDate: c.regNum || '-',
              visa: c.visa || 'E9',
              companyName: c.company || '-',
              refundStatus: '◎경정상담중',
              submissionStatus: '◎재직회사제출',
              monthlyRent: c.isMonthlyRent || c.isMonthlyTenant ? '예' : '아니오',
              claimDate: '-',
              additionalPerformance: 0,
              managerCountry: c.country || '인도네시아',
              managerName: 'Gaby',
            };
          });

          setCustomers(mappedInitial);
        }

        // Stage 2: Parallel background load for ALL 24,634+ records (~1.8s)
        const allClients = await fetchAllClientsParallelFromSupabase();
        if (allClients && allClients.length > 0) {
          const mappedAll: Customer[] = allClients.map((c: any, idx: number) => {
            const registeredDate = c.createdAt
              ? new Date(c.createdAt).toLocaleDateString('ko-KR', { year: '2-digit', month: 'numeric', day: 'numeric' })
              : '26. 7. 15.';

            return {
              id: c.serial || (25000 + idx),
              registeredDate,
              nationality: c.country || '인도네시아',
              name: c.name || '미상',
              birthDate: c.regNum || '-',
              visa: c.visa || 'E9',
              companyName: c.company || '-',
              refundStatus: '◎경정상담중',
              submissionStatus: '◎재직회사제출',
              monthlyRent: c.isMonthlyRent || c.isMonthlyTenant ? '예' : '아니오',
              claimDate: '-',
              additionalPerformance: 0,
              managerCountry: c.country || '인도네시아',
              managerName: 'Gaby',
            };
          });

          setCustomers(mappedAll);
        }
      } catch (e) {
        console.warn('Supabase fetch catch:', e);
      }
    }
    loadSupabaseData();
  }, []);

  // New Customer detail data (matching the complex form layout from the screenshot)
  const [regForm, setRegForm] = useState({
    // Basic Details
    name: '',
    foreignerNumber: '',
    nationality: '미얀마',
    managerName: 'Boram',
    telecom: 'SKT',
    phone: '',
    visaType: 'E10',
    residentAddress: '',
    visaExpiry: '',
    isMonthlyRent: '부',
    refundBankName: 'KB국민은행',
    refundBank: '',
    refundStatus: '대기',
    residentRegisterAddress: '',
    deductionSubmissionStatus: '◎제출이력없음',
    deductionApplyPeriod: '',
    deductionSentDate: '',
    claimRequestDate: '',
    claimCompleteDate: '',
    additionalApplyPerformance: '',
    feePaymentStatus: '후불 22%',

    // Yearly calculations: 2021 ~ 2025
    years: {
      '2021': { active: false, workPeriod: '', workPlace: '', businessNumber: '', birthDate: '', salaryTotal: '0', taxBase: '0', childReduction: '0', childDeduction: '0', decisionTax: '0', localTax: '0', taxRefundTotal: '0', childReductionApply: '90%', childReductionApplyAmt: '0', childDeductionApplyAmt: '0', decisionTaxApplyAmt: '0', localTaxApplyAmt: '0', decisionTaxRefundAmt: '0', refundExpectNational: '0', refundExpectLocal: '0', courtFee: '0', expectedFeeAmt: '0' },
      '2022': { active: false, workPeriod: '', workPlace: '', businessNumber: '', birthDate: '', salaryTotal: '0', taxBase: '0', childReduction: '0', childDeduction: '0', decisionTax: '0', localTax: '0', taxRefundTotal: '0', childReductionApply: '90%', childReductionApplyAmt: '0', childDeductionApplyAmt: '0', decisionTaxApplyAmt: '0', localTaxApplyAmt: '0', decisionTaxRefundAmt: '0', refundExpectNational: '0', refundExpectLocal: '0', courtFee: '0', expectedFeeAmt: '0' },
      '2023': { active: false, workPeriod: '', workPlace: '', businessNumber: '', birthDate: '', salaryTotal: '0', taxBase: '0', childReduction: '0', childDeduction: '0', decisionTax: '0', localTax: '0', taxRefundTotal: '0', childReductionApply: '90%', childReductionApplyAmt: '0', childDeductionApplyAmt: '0', decisionTaxApplyAmt: '0', localTaxApplyAmt: '0', decisionTaxRefundAmt: '0', refundExpectNational: '0', refundExpectLocal: '0', courtFee: '0', expectedFeeAmt: '0' },
      '2024': { active: false, workPeriod: '', workPlace: '', businessNumber: '', birthDate: '', salaryTotal: '0', taxBase: '0', childReduction: '0', childDeduction: '0', decisionTax: '0', localTax: '0', taxRefundTotal: '0', childReductionApply: '90%', childReductionApplyAmt: '0', childDeductionApplyAmt: '0', decisionTaxApplyAmt: '0', localTaxApplyAmt: '0', decisionTaxRefundAmt: '0', refundExpectNational: '0', refundExpectLocal: '0', courtFee: '0', expectedFeeAmt: '0' },
      '2025': { active: false, workPeriod: '', workPlace: '', businessNumber: '', birthDate: '', salaryTotal: '0', taxBase: '0', childReduction: '0', childDeduction: '0', decisionTax: '0', localTax: '0', taxRefundTotal: '0', childReductionApply: '90%', childReductionApplyAmt: '0', childDeductionApplyAmt: '0', decisionTaxApplyAmt: '0', localTaxApplyAmt: '0', decisionTaxRefundAmt: '0', refundExpectNational: '0', refundExpectLocal: '0', courtFee: '0', expectedFeeAmt: '0' },
    } as Record<string, any>,

    // Customer Consultation Information
    snsName: '',
    snsAddress: '',
    hometaxId: '',
    hometaxPw: '',
    customerGrade: '',
    greenContractDate: '',
    consultMemo: '',
    refundPerformance: '0',
    refundPerformanceDate: '',
    feeReceivedPerformance: '0',
    feeReceivedDate: ''
  });

  // Dynamic Years for Settlement
  const [targetYears, setTargetYears] = useState<string[]>(['2021', '2022', '2023', '2024', '2025']);
  const [selectedFeeRate, setSelectedFeeRate] = useState<number>(22);

  const handleResetAll = () => {
    setRegForm({
      name: '',
      foreignerNumber: '',
      nationality: '미얀마',
      managerName: 'Boram',
      telecom: 'SKT',
      phone: '',
      visaType: 'E10',
      residentAddress: '',
      visaExpiry: '',
      isMonthlyRent: '부',
      refundBankName: 'KB국민은행',
      refundBank: '',
      refundStatus: '대기',
      residentRegisterAddress: '',
      deductionSubmissionStatus: '◎제출이력없음',
      deductionApplyPeriod: '',
      deductionSentDate: '',
      claimRequestDate: '',
      claimCompleteDate: '',
      additionalApplyPerformance: '',
      feePaymentStatus: '후불 22%',

      years: {
        '2021': { active: false, workPeriod: '', workPlace: '', businessNumber: '', birthDate: '', salaryTotal: '0', taxBase: '0', childReduction: '0', childDeduction: '0', decisionTax: '0', localTax: '0', taxRefundTotal: '0', childReductionApply: '90%', childReductionApplyAmt: '0', childDeductionApplyAmt: '0', decisionTaxApplyAmt: '0', localTaxApplyAmt: '0', decisionTaxRefundAmt: '0', refundExpectNational: '0', refundExpectLocal: '0', courtFee: '0', expectedFeeAmt: '0' },
        '2022': { active: false, workPeriod: '', workPlace: '', businessNumber: '', birthDate: '', salaryTotal: '0', taxBase: '0', childReduction: '0', childDeduction: '0', decisionTax: '0', localTax: '0', taxRefundTotal: '0', childReductionApply: '90%', childReductionApplyAmt: '0', childDeductionApplyAmt: '0', decisionTaxApplyAmt: '0', localTaxApplyAmt: '0', decisionTaxRefundAmt: '0', refundExpectNational: '0', refundExpectLocal: '0', courtFee: '0', expectedFeeAmt: '0' },
        '2023': { active: false, workPeriod: '', workPlace: '', businessNumber: '', birthDate: '', salaryTotal: '0', taxBase: '0', childReduction: '0', childDeduction: '0', decisionTax: '0', localTax: '0', taxRefundTotal: '0', childReductionApply: '90%', childReductionApplyAmt: '0', childDeductionApplyAmt: '0', decisionTaxApplyAmt: '0', localTaxApplyAmt: '0', decisionTaxRefundAmt: '0', refundExpectNational: '0', refundExpectLocal: '0', courtFee: '0', expectedFeeAmt: '0' },
        '2024': { active: false, workPeriod: '', workPlace: '', businessNumber: '', birthDate: '', salaryTotal: '0', taxBase: '0', childReduction: '0', childDeduction: '0', decisionTax: '0', localTax: '0', taxRefundTotal: '0', childReductionApply: '90%', childReductionApplyAmt: '0', childDeductionApplyAmt: '0', decisionTaxApplyAmt: '0', localTaxApplyAmt: '0', decisionTaxRefundAmt: '0', refundExpectNational: '0', refundExpectLocal: '0', courtFee: '0', expectedFeeAmt: '0' },
        '2025': { active: false, workPeriod: '', workPlace: '', businessNumber: '', birthDate: '', salaryTotal: '0', taxBase: '0', childReduction: '0', childDeduction: '0', decisionTax: '0', localTax: '0', taxRefundTotal: '0', childReductionApply: '90%', childReductionApplyAmt: '0', childDeductionApplyAmt: '0', decisionTaxApplyAmt: '0', localTaxApplyAmt: '0', decisionTaxRefundAmt: '0', refundExpectNational: '0', refundExpectLocal: '0', courtFee: '0', expectedFeeAmt: '0' },
      },

      snsName: '',
      snsAddress: '',
      hometaxId: '',
      hometaxPw: '',
      customerGrade: '',
      greenContractDate: '',
      consultMemo: '',
      refundPerformance: '0',
      refundPerformanceDate: '',
      feeReceivedPerformance: '0',
      feeReceivedDate: ''
    });
    setTargetYears(['2021', '2022', '2023', '2024', '2025']);
    showToast('고객 등록 정보 및 정산 데이터가 전체 초기화되었습니다.', 'info');
  };

  const handleFeeRateChange = (rate: number) => {
    setSelectedFeeRate(rate);
    setRegForm(prev => {
      const updatedYears = { ...prev.years };
      targetYears.forEach(yr => {
        if (updatedYears[yr]) {
          const courtFee = Number(updatedYears[yr].courtFee) || 0;
          updatedYears[yr] = {
            ...updatedYears[yr],
            expectedFeeAmt: String(Math.round(courtFee * (rate / 100)))
          };
        }
      });
      return { ...prev, years: updatedYears };
    });
  };

  const handleAddYear = () => {
    const maxYear = targetYears.length > 0 ? Math.max(...targetYears.map(Number)) : 2025;
    const nextYearSuggested = String(maxYear + 1);
    const newYearInput = window.prompt('추가할 연말정산 연도를 입력하세요 (숫자 4자리):', nextYearSuggested);
    if (!newYearInput) return;
    
    const cleanYear = newYearInput.trim();
    if (!/^\d{4}$/.test(cleanYear)) {
      alert('올바른 4자리 연도를 입력해주세요 (예: 2026).');
      return;
    }
    if (targetYears.includes(cleanYear)) {
      alert('이미 존재하는 연도입니다.');
      return;
    }

    // Add to targetYears in sorted order
    const updatedYears = [...targetYears, cleanYear].sort((a, b) => Number(a) - Number(b));
    setTargetYears(updatedYears);

    // Initialize in regForm.years if not exists
    setRegForm(prev => {
      const existingYears = { ...prev.years };
      if (!existingYears[cleanYear]) {
        existingYears[cleanYear] = {
          active: false,
          workPeriod: '',
          workPlace: '',
          businessNumber: '',
          birthDate: '',
          salaryTotal: '0',
          taxBase: '0',
          childReduction: '0',
          childDeduction: '0',
          decisionTax: '0',
          localTax: '0',
          taxRefundTotal: '0',
          childReductionApply: '0',
          childReductionApplyAmt: '0',
          childDeductionApplyAmt: '0',
          decisionTaxApplyAmt: '0',
          localTaxApplyAmt: '0',
          decisionTaxRefundAmt: '0',
          refundExpectNational: '0',
          refundExpectLocal: '0',
          courtFee: '0',
          expectedFeeAmt: '0'
        };
      }
      return { ...prev, years: existingYears };
    });
    showToast(`${cleanYear}년도가 정산 연도에 추가되었습니다.`, 'success');
  };

  const handleRemoveYear = (yearToRemove: string) => {
    if (window.confirm(`${yearToRemove}년도 정산 데이터를 정산 화면에서 제외하시겠습니까?\n(입력된 임시 데이터는 유지되나 화면에 표시되지 않습니다)`)) {
      setTargetYears(prev => prev.filter(yr => yr !== yearToRemove));
      showToast(`${yearToRemove}년도가 정산 연도에서 제외되었습니다.`, 'info');
    }
  };



  const handleDownloadPdf = async (yr: string) => {
    const yearData = regForm.years[yr];
    
    // 1. Memory uploaded file
    if (yearData?.pdfFile) {
      const url = URL.createObjectURL(yearData.pdfFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = yearData.pdfFile.name || `${yr}년도_원천징수영수증.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast(`[${yr}년도] PDF 원본 파일 다운로드를 완료했습니다.`, 'success');
      return;
    }

    // 1-2. Supabase Storage uploaded file URL
    if ((yearData as any)?.fileURL) {
      window.open((yearData as any).fileURL, '_blank');
      showToast(`[${yr}년도] Supabase 스토리지 원본 PDF 파일을 엽니다.`, 'success');
      return;
    }

    // 2. Try fetching from public/${yr}.pdf
    try {
      const pdfUrl = `/${yr}.pdf`;
      const response = await fetch(pdfUrl);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${yr}년도_원천징수영수증.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        showToast(`[${yr}년도] PDF 원본 파일 다운로드를 완료했습니다.`, 'success');
        return;
      }
    } catch (e) {
      console.warn('PDF fetch error:', e);
    }

    // 3. Fallback text file
    const textContent = `[노벨세무회계 연구] ${yr}년도 근로소득 원천징수영수증 정산 데이터\n\n` +
      `신청인: ${regForm.name || '-'}\n` +
      `외국인등록번호: ${regForm.foreignerNumber || '-'}\n` +
      `근무처: ${yearData?.workPlace || '-'}\n` +
      `근무기간: ${yearData?.workPeriod || '-'}\n` +
      `총급여액: ${Number(yearData?.salaryTotal || 0).toLocaleString()}원\n` +
      `산출세액: ${Number(yearData?.taxBase || 0).toLocaleString()}원\n` +
      `기존 결정세액(소득세): ${Number(yearData?.decisionTax || 0).toLocaleString()}원\n` +
      `기존 결정세액(지방세): ${Number(yearData?.localTax || 0).toLocaleString()}원\n` +
      `청년세액감면 적용액: ${Number(yearData?.childReductionApplyAmt || 0).toLocaleString()}원\n` +
      `예상 환급금 합계: ${Number(yearData?.courtFee || 0).toLocaleString()}원\n`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${yr}년도_원천징수영수증_정산서.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(`[${yr}년도] 정산서 다운로드를 완료했습니다.`, 'success');
  };

  const handleSingleYearPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>, fallbackYr?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast(`PDF 분석을 시작합니다 (${file.name})...`, 'info');
      const text = await extractTextFromPdf(file);
      const parsed = parsePdfText(text, fallbackYr);

      // Automatically detect year from PDF text, fallback to target column year
      const yr = parsed.year || fallbackYr;
      if (!yr || !/^\d{4}$/.test(yr)) {
        showToast(`PDF 파일에서 귀속연도를 감지하지 못했습니다.`, 'error');
        return;
      }

      // Automatically activate the year column if not present
      setTargetYears(prev => {
        if (!prev.includes(yr)) {
          return [...prev, yr].sort((a, b) => Number(a) - Number(b));
        }
        return prev;
      });

      const originalDecisionTax = Number(parsed.determinedIncomeTax) || 0;
      const originalLocalTax = Number(parsed.determinedLocalTax) || 0;
      const calculatedTax = Number(parsed.decisionTax) || 0;
      const childDeduction = Number(parsed.childDeduction) || 0;

      const reductionAmt = Math.min(1500000, Math.round(calculatedTax * 0.9));
      const remainingTax = Math.max(0, calculatedTax - reductionAmt);
      const changedChildDeduction = calculatedTax > 0 ? Math.round(childDeduction * (remainingTax / calculatedTax)) : 0;
      
      const changedDecisionTax = Math.max(0, remainingTax - changedChildDeduction);
      const changedLocalTax = Math.round(changedDecisionTax * 0.1);
      
      const refundNational = Math.max(0, originalDecisionTax - changedDecisionTax);
      const refundLocal = Math.max(0, originalLocalTax - changedLocalTax);
      const totalCourtFee = refundNational + refundLocal;
      const expectedFee = Math.round(totalCourtFee * (selectedFeeRate / 100));

      setRegForm(prev => {
        const updatedYears = { ...prev.years };
        updatedYears[yr] = {
          active: true,
          isFileUploaded: true,
          pdfFile: file,
          workPeriod: parsed.workPeriod || updatedYears[yr]?.workPeriod || '',
          workPlace: parsed.workPlace || updatedYears[yr]?.workPlace || '',
          businessNumber: parsed.businessNumber || updatedYears[yr]?.businessNumber || '',
          birthDate: parsed.foreignerNumber ? parsed.foreignerNumber.substring(0, 6) : updatedYears[yr]?.birthDate || '',
          salaryTotal: parsed.salaryTotal || '0',
          taxBase: parsed.decisionTax || parsed.taxBase || '0',
          childReduction: parsed.childReduction || '0',
          childDeduction: parsed.childDeduction || '0',
          decisionTax: parsed.determinedIncomeTax || '0',
          localTax: parsed.determinedLocalTax || '0',
          taxRefundTotal: String(originalDecisionTax + originalLocalTax),
          
          childReductionApply: reductionAmt > 0 ? 'Y' : 'N',
          childReductionApplyAmt: String(reductionAmt),
          childDeductionApplyAmt: String(changedChildDeduction),
          decisionTaxApplyAmt: String(changedDecisionTax),
          localTaxApplyAmt: String(changedLocalTax),
          decisionTaxRefundAmt: String(changedDecisionTax + changedLocalTax),
          
          refundExpectNational: String(refundNational),
          refundExpectLocal: String(refundLocal),
          courtFee: String(totalCourtFee),
          expectedFeeAmt: String(expectedFee)
        };

        const updatedBasic: any = {};
        if (parsed.name && !prev.name) updatedBasic.name = parsed.name;
        if (parsed.foreignerNumber && !prev.foreignerNumber) updatedBasic.foreignerNumber = parsed.foreignerNumber;

        return {
          ...prev,
          ...updatedBasic,
          years: updatedYears
        };
      });

      showToast(`PDF 자동 분석 완료! [${yr}년도] 칸에 데이터가 자동으로 반영되었습니다.`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast(`PDF 분석 중 오류가 발생했습니다: ${err.message || err}`, 'error');
    }
  };

  const handleBulkPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    showToast(`${files.length}개 PDF 파일 자동 분석을 시작합니다...`, 'info');
    let successCount = 0;
    const detectedYears: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const text = await extractTextFromPdf(file);
        const parsed = parsePdfText(text);
        const yr = parsed.year;

        if (!yr || !/^\d{4}$/.test(yr)) {
          showToast(`파일 [${file.name}]에서 귀속연도를 감지하지 못했습니다.`, 'error');
          continue;
        }

        if (!detectedYears.includes(yr)) detectedYears.push(yr);
        successCount++;

        setTargetYears(prev => {
          if (!prev.includes(yr)) {
            return [...prev, yr].sort((a, b) => Number(a) - Number(b));
          }
          return prev;
        });

        const originalDecisionTax = Number(parsed.determinedIncomeTax) || 0;
        const originalLocalTax = Number(parsed.determinedLocalTax) || 0;
        const calculatedTax = Number(parsed.decisionTax) || 0;
        const childDeduction = Number(parsed.childDeduction) || 0;

        const reductionAmt = Math.min(1500000, Math.round(calculatedTax * 0.9));
        const remainingTax = Math.max(0, calculatedTax - reductionAmt);
        const changedChildDeduction = calculatedTax > 0 ? Math.round(childDeduction * (remainingTax / calculatedTax)) : 0;
        
        const changedDecisionTax = Math.max(0, remainingTax - changedChildDeduction);
        const changedLocalTax = Math.round(changedDecisionTax * 0.1);
        
        const refundNational = Math.max(0, originalDecisionTax - changedDecisionTax);
        const refundLocal = Math.max(0, originalLocalTax - changedLocalTax);
        const totalCourtFee = refundNational + refundLocal;
        const expectedFee = Math.round(totalCourtFee * (selectedFeeRate / 100));

        setRegForm(prev => {
          const updatedYears = { ...prev.years };
          updatedYears[yr] = {
            active: true,
            isFileUploaded: true,
            pdfFile: file,
            workPeriod: parsed.workPeriod || '',
            workPlace: parsed.workPlace || '',
            businessNumber: parsed.businessNumber || '',
            birthDate: parsed.foreignerNumber ? parsed.foreignerNumber.substring(0, 6) : '',
            salaryTotal: parsed.salaryTotal || '0',
            taxBase: parsed.decisionTax || parsed.taxBase || '0',
            childReduction: parsed.childReduction || '0',
            childDeduction: parsed.childDeduction || '0',
            decisionTax: parsed.determinedIncomeTax || '0',
            localTax: parsed.determinedLocalTax || '0',
            taxRefundTotal: String(originalDecisionTax + originalLocalTax),
            
            childReductionApply: reductionAmt > 0 ? 'Y' : 'N',
            childReductionApplyAmt: String(reductionAmt),
            childDeductionApplyAmt: String(changedChildDeduction),
            decisionTaxApplyAmt: String(changedDecisionTax),
            localTaxApplyAmt: String(changedLocalTax),
            decisionTaxRefundAmt: String(changedDecisionTax + changedLocalTax),
            
            refundExpectNational: String(refundNational),
            refundExpectLocal: String(refundLocal),
            courtFee: String(totalCourtFee),
            expectedFeeAmt: String(expectedFee)
          };

          const updatedBasic: any = {};
          if (parsed.name && !prev.name) updatedBasic.name = parsed.name;
          if (parsed.foreignerNumber && !prev.foreignerNumber) updatedBasic.foreignerNumber = parsed.foreignerNumber;

          return {
            ...prev,
            ...updatedBasic,
            years: updatedYears
          };
        });
      } catch (err: any) {
        console.error(err);
        showToast(`파일 [${file.name}] 분석 중 오류가 발생했습니다.`, 'error');
      }
    }

    if (successCount > 0) {
      showToast(`총 ${successCount}개 PDF 파일 분석 완료! (${detectedYears.join(', ')}년도 자동 분류되어 입력됨)`, 'success');
    }
  };

  // Options List
  const nationalities = [
    '네팔',
    '캄보디아',
    '인도네시아',
    '베트남',
    '태국',
    '미얀마',
    '필리핀',
    '스리랑카',
    '방글라데시',
    '우즈베키스탄',
    '파키스탄',
    '몽골',
    '키르기스스탄',
    '고려인',
    '카자흐스탄',
    '중국',
    '한국',
    '기타국가'
  ];
  const refundStatuses = [
    '대기',
    '◎경정상담중',
    '자격안됨',
    '◎자격안됨(확인완료)',
    '고객취소',
    '홈택스가입불가',
    '◆간편인증서류가입요청',
    '◆간편인증서류완료',
    '◆녹취계약요청',
    '◆녹취계약완료',
    '※감면명세서요청중',
    '◇경청청구요청',
    '노벨경정청구중',
    '세로경정청구중',
    '♥경정청구완료',
    '경정청구반려',
    '▲경정청구기각',
    '♡수수료요청',
    '♡국세수수료수납완료',
    '◆지방세수수료수납완료',
    '◆수수료 연체'
  ];
  const visaTypes = [
    'F1',
    'F2',
    'F3',
    'F4',
    'F5',
    'F6',
    'E7',
    'E9',
    'E10',
    'D10',
    'H2',
    '한국국적',
    '기타'
  ];
  const bankList = [
    'KB국민은행',
    'SC제일은행',
    '경남은행',
    '광주은행',
    '기업은행',
    '농협',
    '대구은행',
    '부산은행',
    '산업은행',
    '새마을금고',
    '수협',
    '신한은행',
    '신협',
    '우리은행',
    '우체국',
    '전북은행',
    '축협',
    '카카오',
    '케이뱅크',
    '하나은행',
    '한국씨티은행',
    '토스뱅크'
  ];
  const submissionStatuses = [
    '◎제출이력없음',
    '◎이전회사재출',
    '◎재직회사재출',
    '우편발송',
    '◆팩스발송',
    '◆사진발송',
    '▶명세서 홈텍스반영',
    '♡감면신청서처리',
    '감면명세서 요망',
    '기타'
  ];

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Sync Manager Countries
  const handleInlineManagerChange = (customerId: number, managerName: string) => {
    const matched = managers.find(m => m.name === managerName);
    if (!matched) return;
    setCustomers(prev =>
      prev.map(c =>
        c.id === customerId ? { ...c, managerName, managerCountry: matched.country } : c
      )
    );
  };

  const handleInlineCountryChange = (customerId: number, nationality: string) => {
    setCustomers(prev =>
      prev.map(c => c.id === customerId ? { ...c, nationality } : c)
    );
  };

  const handleSaveRow = (customerId: number) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      showToast(`${customer.name}님의 담당자 정보가 저장되었습니다.`, 'success');
    }
  };

  const handleOpenCustomerRegistration = async (customer: Customer) => {
    try {
      showToast(`${customer.name} 님의 상세 정보를 불러오는 중입니다...`, 'info');

      const { data: clientDetails } = await supabase
        .from('Client')
        .select('*')
        .eq('regNum', customer.birthDate)
        .maybeSingle();

      let yearRecords: any[] = [];
      if (clientDetails?.id) {
        const { data: yData } = await supabase
          .from('YearEndData')
          .select('*')
          .eq('clientId', clientDetails.id);
        if (yData) yearRecords = yData;
      }

      const yearsObj: Record<string, any> = {
        '2021': { totalSalary: 0, originalDeterminedTax: 0, appliedTaxReduction: 0, expectedRefundNational: 0, expectedRefundLocal: 0, recalcDeterminedTax: 0, recalcLocalTax: 0, isReductionEligible: '가', workPlace: '', companyRegNum: '', pdfFile: null, pdfUrl: '' },
        '2022': { totalSalary: 0, originalDeterminedTax: 0, appliedTaxReduction: 0, expectedRefundNational: 0, expectedRefundLocal: 0, recalcDeterminedTax: 0, recalcLocalTax: 0, isReductionEligible: '가', workPlace: '', companyRegNum: '', pdfFile: null, pdfUrl: '' },
        '2023': { totalSalary: 0, originalDeterminedTax: 0, appliedTaxReduction: 0, expectedRefundNational: 0, expectedRefundLocal: 0, recalcDeterminedTax: 0, recalcLocalTax: 0, isReductionEligible: '가', workPlace: '', companyRegNum: '', pdfFile: null, pdfUrl: '' },
        '2024': { totalSalary: 0, originalDeterminedTax: 0, appliedTaxReduction: 0, expectedRefundNational: 0, expectedRefundLocal: 0, recalcDeterminedTax: 0, recalcLocalTax: 0, isReductionEligible: '가', workPlace: '', companyRegNum: '', pdfFile: null, pdfUrl: '' },
        '2025': { totalSalary: 0, originalDeterminedTax: 0, appliedTaxReduction: 0, expectedRefundNational: 0, expectedRefundLocal: 0, recalcDeterminedTax: 0, recalcLocalTax: 0, isReductionEligible: '가', workPlace: '', companyRegNum: '', pdfFile: null, pdfUrl: '' },
      };

      for (const yr of yearRecords) {
        const yrKey = String(yr.year);
        if (yearsObj[yrKey]) {
          yearsObj[yrKey] = {
            totalSalary: yr.netSalary || yr.netSalaryFromReceipt || yr.netSalaryFromAllCompany || 0,
            originalDeterminedTax: yr.determinedTax || yr.determineTax || 0,
            appliedTaxReduction: yr.smallBusinessYouthTaxCredit || yr.smallBusinessDeduction || yr.calculatedTax || 0,
            expectedRefundNational: yr.determinedTaxRefund || yr.totalTaxRefund || 0,
            expectedRefundLocal: yr.localTaxRefund || 0,
            recalcDeterminedTax: yr.changedDeterminedTax || yr.changedDetermineTax || 0,
            recalcLocalTax: yr.changedLocalTax || 0,
            isReductionEligible: yr.isSmallBusiness || yr.isSmallBusinessDeduction ? '여' : '부',
            workPlace: yr.companyName || customer.companyName || '',
            companyRegNum: yr.companyRegNo || yr.companyRegNum || '',
            pdfFile: null,
            pdfUrl: yr.fileURL || '',
            correctionFileUrl: yr.correction_file_url || ''
          };
        }
      }

      setRegForm(prev => ({
        ...prev,
        name: clientDetails?.name || customer.name,
        foreignerNumber: clientDetails?.regNum || customer.birthDate,
        nationality: clientDetails?.country || customer.nationality,
        managerName: customer.managerName || 'Boram',
        phone: clientDetails?.phone || '',
        telecom: clientDetails?.phoneComp || clientDetails?.phoneCompany || 'KT',
        visaType: clientDetails?.visa || customer.visa,
        visaExpiry: clientDetails?.visaExpireDate ? clientDetails.visaExpireDate.split('T')[0] : '',
        isMonthlyRent: clientDetails?.isMonthlyTenant || clientDetails?.isMonthlyRent ? '가' : '부',
        refundBankName: clientDetails?.bank || '',
        refundBank: clientDetails?.bankAccount || '',
        refundStatus: clientDetails?.paybackProgress || customer.refundStatus || '◎경정상담중',
        residentRegisterAddress: clientDetails?.address || '',
        residentAddress: clientDetails?.address || '',
        deductionSubmissionStatus: '◎재직회사제출',
        deductionSentDate: clientDetails?.taxReductionSentDate ? clientDetails.taxReductionSentDate.split('T')[0] : '',
        additionalApplyPerformance: clientDetails?.isAdditionalPayback || clientDetails?.isAdditionalApply ? '가' : '부',
        claimRequestDate: clientDetails?.rectificationRequestDate ? clientDetails.rectificationRequestDate.split('T')[0] : '',
        feePaymentStatus: clientDetails?.feeMethod || '후불 22%',
        hometaxId: clientDetails?.hometaxId || '',
        hometaxPw: clientDetails?.hometaxPw || '',
        years: yearsObj
      }));

      setCurrentView('registration');
      showToast(`${customer.name} 님의 고객 등록 관리 화면을 열었습니다.`, 'success');
    } catch (err) {
      console.error('Error loading customer details:', err);
      setRegForm(prev => ({
        ...prev,
        name: customer.name,
        foreignerNumber: customer.birthDate,
        nationality: customer.nationality,
        visaType: customer.visa,
      }));
      setCurrentView('registration');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(filteredCustomers.map(c => c.id));
    else setSelectedIds([]);
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) setSelectedIds(prev => [...prev, id]);
    else setSelectedIds(prev => prev.filter(item => item !== id));
  };

  const handleDeleteCustomers = () => {
    if (selectedIds.length === 0) {
      showToast('삭제할 항목을 선택해 주세요.', 'error');
      return;
    }
    if (window.confirm(`선택한 ${selectedIds.length}건의 데이터를 삭제하시겠습니까?`)) {
      setCustomers(prev => prev.filter(c => !selectedIds.includes(c.id)));
      setSelectedIds([]);
      showToast('삭제가 완료되었습니다.', 'success');
    }
  };

  // Export to Excel (CSV)
  const handleExportExcel = () => {
    if (filteredCustomers.length === 0) {
      showToast('내보낼 데이터가 없습니다.', 'error');
      return;
    }
    const headers = ['번호', '등록일', '국적', '이름', '생년월일', '비자', '회사명', '환급처리상태', '월세여부', '담당자'];
    const csvRows = [headers.join(',')];

    filteredCustomers.forEach(c => {
      csvRows.push([
        c.id,
        `"${c.registeredDate}"`,
        `"${c.nationality}"`,
        `"${c.name}"`,
        `"${c.birthDate}"`,
        `"${c.visa}"`,
        `"${c.companyName}"`,
        `"${c.refundStatus}"`,
        `"${c.monthlyRent}"`,
        `"${c.managerName}"`
      ].join(','));
    });

    const csvContent = '\uFEFF' + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `노벨세무회계_고객목록_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('엑셀 다운로드가 완료되었습니다.', 'success');
  };

  // Save complex registration form
  const handleSaveRegistration = async () => {
    if (!regForm.name || !regForm.foreignerNumber) {
      showToast('신청인 이름과 외국인 등록번호는 필수입니다.', 'error');
      return;
    }

    const nextId = customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 24708;
    const today = new Date();
    const formattedDate = `${String(today.getFullYear()).slice(-2)}. ${today.getMonth() + 1}. ${today.getDate()}.`;

    // Map registration form to simplified list view customer
    const newCustomerItem: Customer = {
      id: nextId,
      registeredDate: formattedDate,
      nationality: regForm.nationality,
      name: regForm.name.toUpperCase(),
      birthDate: regForm.foreignerNumber,
      visa: regForm.visaType,
      companyName: regForm.years['2025']?.workPlace || regForm.years['2024']?.workPlace || '-',
      refundStatus: regForm.refundStatus,
      submissionStatus: regForm.deductionSubmissionStatus,
      monthlyRent: regForm.isMonthlyRent === '가' ? '예' : '아니오',
      claimDate: regForm.claimCompleteDate || '-',
      additionalPerformance: Number(regForm.additionalApplyPerformance) || 0,
      managerCountry: regForm.nationality,
      managerName: managers.find(m => m.country === regForm.nationality)?.name || managers[0].name
    };

    setCustomers(prev => [newCustomerItem, ...prev]);

    // Gather uploaded PDF file objects for each year
    const pdfFiles: Record<string, File | null> = {
      '2022': regForm.years['2022']?.pdfFile || null,
      '2023': regForm.years['2023']?.pdfFile || null,
      '2024': regForm.years['2024']?.pdfFile || null,
      '2025': regForm.years['2025']?.pdfFile || null,
    };

    showToast('Supabase 클라우드 저장소에 고객 정보 및 PDF 파일 동기화를 진행 중입니다...', 'info');

    try {
      const res = await saveRegistrationToSupabase(regForm, pdfFiles);
      if (res && res.success) {
        showToast('고객 정보, 정산 결과 및 PDF 파일이 Supabase DB에 완벽히 동기화되었습니다!', 'success');
      } else {
        showToast('로컬 저장은 완료되었으나, Supabase 동기화 중 권한/네트워크 주의사항이 있습니다.', 'info');
      }
    } catch (err) {
      console.warn('Supabase save error:', err);
    }

    setCurrentView('customer'); // Return to list view
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordChangeText.current || !passwordChangeText.new || !passwordChangeText.confirm) {
      showToast('모든 비밀번호 필드를 채워주세요.', 'error');
      return;
    }
    if (passwordChangeText.new !== passwordChangeText.confirm) {
      showToast('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.', 'error');
      return;
    }
    showToast('비밀번호가 성공적으로 변경되었습니다.', 'success');
    setPasswordChangeText({ current: '', new: '', confirm: '' });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedNationality('');
    setSelectedRefundStatus('');
    setSelectedManager('');
    showToast('필터가 초기화되었습니다.', 'info');
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(c.id).includes(searchQuery);
    const matchesNationality = selectedNationality ? c.nationality === selectedNationality : true;
    const matchesRefundStatus = selectedRefundStatus ? c.refundStatus === selectedRefundStatus : true;
    const matchesManager = selectedManager ? c.managerName === selectedManager : true;
    return matchesSearch && matchesNationality && matchesRefundStatus && matchesManager;
  });

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / itemsPerPage));
  const displayedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      {toast && (
        <div className="toast">
          <CheckCircle2 size={16} color={toast.type === 'error' ? '#ff4b4b' : '#2db74f'} />
          <span>{toast.message}</span>
        </div>
      )}

      {!isLoggedIn && (
        <div className="login-page">
          <div className="login-box">
            <div className="login-logo">
              <div className="login-logo-icon">N</div>
              <div className="login-logo-text">
                <span className="login-logo-title">노벨 세무회계 연구</span>
                <span className="login-logo-subtitle">ADMIN PORTAL</span>
              </div>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); showToast('관리자 시스템에 접속하였습니다.', 'success'); }}>
              <div className="form-group">
                <label>관리자 아이디</label>
                <input
                  type="text"
                  className="login-input"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="admin"
                />
              </div>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label>비밀번호</label>
                <input
                  type="password"
                  className="login-input"
                  value={loginPw}
                  onChange={(e) => setLoginPw(e.target.value)}
                  placeholder="admin"
                />
              </div>
              <button type="submit" className="btn-login">로그인</button>
            </form>
          </div>
        </div>
      )}

      {isLoggedIn && (
        <div className="app-container notranslate" translate="no">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="sidebar-logo">
              <div className="logo-icon">N</div>
              <div className="sidebar-logo-text">
                <span className="logo-title">노벨 세무회계 연구</span>
                <span className="logo-subtitle">TAX & ACCOUNTING</span>
              </div>
            </div>

            <nav className="sidebar-menu">
              <button
                className={`sidebar-item ${currentView === 'customer' || currentView === 'registration' ? 'active' : ''}`}
                onClick={() => setCurrentView('customer')}
              >
                <UserCheck size={18} />
                고객등록 관리
              </button>
              <button
                className={`sidebar-item ${currentView === 'staff' ? 'active' : ''}`}
                onClick={() => setCurrentView('staff')}
              >
                <Users size={18} />
                직원 관리
              </button>
              <button
                className={`sidebar-item ${currentView === 'password' ? 'active' : ''}`}
                onClick={() => setCurrentView('password')}
              >
                <Lock size={18} />
                비밀번호 변경
              </button>
            </nav>

            <div className="sidebar-footer">
              <button className="sidebar-item" onClick={() => { setIsLoggedIn(false); showToast('로그아웃되었습니다.', 'info'); }}>
                <LogOut size={18} />
                로그아웃
              </button>
            </div>
          </aside>

          {/* Main Workspace */}
          <main className="main-content">
            
            {/* 1. Customer List View */}
            {currentView === 'customer' && (
              <>
                <header className="top-bar">
                  <div className="filter-controls">
                    <button className="btn-filter" onClick={() => setIsFilterModalOpen(true)}>
                      <Filter size={16} />
                      필터추가
                    </button>
                    <button className="btn-filter-reset" title="필터 초기화" onClick={handleResetFilters}>
                      <RotateCcw size={16} />
                    </button>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type="text"
                        className="form-control"
                        style={{ paddingLeft: '34px', width: '220px', height: '38px' }}
                        placeholder="이름 또는 회사명 검색"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="action-controls">
                    <button className="btn-action btn-add" onClick={() => setCurrentView('registration')}>
                      <Plus size={16} />
                      신규등록
                    </button>
                    <button className="btn-action btn-delete" onClick={handleDeleteCustomers}>
                      <Trash2 size={16} />
                      삭제
                    </button>
                    <button className="btn-action btn-excel" onClick={handleExportExcel}>
                      <FileSpreadsheet size={16} />
                      Excel로 내보내기
                    </button>
                    <div className="record-count">
                      총 <span>{filteredCustomers.length}</span>건
                    </div>
                  </div>
                </header>

                <div className="table-wrapper">
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>번호</th>
                          <th>
                            <label className="checkbox-container" style={{ paddingLeft: 0 }}>
                              <input
                                type="checkbox"
                                checked={filteredCustomers.length > 0 && selectedIds.length === filteredCustomers.length}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                              />
                              <span className="checkmark"></span>
                            </label>
                          </th>
                          <th>등록일</th>
                          <th>국적</th>
                          <th>이름</th>
                          <th>생년월일</th>
                          <th>비자</th>
                          <th>회사명</th>
                          <th>환급처리상태</th>
                          <th>감면명세서 제출상태</th>
                          <th>월세여부</th>
                          <th>경정청구일</th>
                          <th>추가 신청인 실적</th>
                          <th style={{ width: '260px' }}>담당자 변경</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCustomers.length === 0 ? (
                          <tr>
                            <td colSpan={14} style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                              조건에 맞는 고객 정보가 존재하지 않습니다.
                            </td>
                          </tr>
                        ) : (
                          displayedCustomers.map((customer) => {
                            let refundClass = 'badge-pending';
                            if (customer.refundStatus.includes('상담중')) refundClass = 'badge-consult';
                            if (customer.refundStatus.includes('요청') || customer.refundStatus.includes('가입요청')) refundClass = 'badge-request';
                            if (customer.refundStatus.includes('완료') || customer.refundStatus.includes('수납완료')) refundClass = 'badge-success';

                            let submissionClass = 'badge-pending';
                            if (customer.submissionStatus.includes('재직회사') || customer.submissionStatus.includes('이전회사') || customer.submissionStatus.includes('재획회사')) submissionClass = 'badge-submit-resubmit';
                            if (customer.submissionStatus.includes('제출이력없음')) submissionClass = 'badge-submit-none';

                            return (
                              <tr key={customer.id} onDoubleClick={() => handleOpenCustomerRegistration(customer)} style={{ cursor: 'pointer' }}>
                                <td>{customer.id}</td>
                                <td>
                                  <label className="checkbox-container" style={{ paddingLeft: 0 }}>
                                    <input
                                      type="checkbox"
                                      checked={selectedIds.includes(customer.id)}
                                      onChange={(e) => handleSelectRow(customer.id, e.target.checked)}
                                    />
                                    <span className="checkmark"></span>
                                  </label>
                                </td>
                                <td>{customer.registeredDate}</td>
                                <td>{customer.nationality}</td>
                                <td 
                                  style={{ fontWeight: 600, color: '#0284c7', cursor: 'pointer', textDecoration: 'underline' }}
                                  onClick={() => handleOpenCustomerRegistration(customer)}
                                  title="클릭하여 고객등록 관리 화면 열기"
                                >
                                  {customer.name}
                                </td>
                                <td>{customer.birthDate}</td>
                                <td>{customer.visa}</td>
                                <td>{customer.companyName}</td>
                                <td>
                                  <span className={`badge-status ${refundClass}`}>
                                    {customer.refundStatus}
                                  </span>
                                </td>
                                <td>
                                  {customer.submissionStatus !== '-' ? (
                                    <span className={`badge-status ${submissionClass}`}>
                                      {customer.submissionStatus}
                                    </span>
                                  ) : (
                                    '-'
                                  )}
                                </td>
                                <td>{customer.monthlyRent}</td>
                                <td>{customer.claimDate}</td>
                                <td>{customer.additionalPerformance}</td>
                                <td>
                                  <div className="inline-edit">
                                    <select
                                      className="select-sm"
                                      value={customer.nationality}
                                      onChange={(e) => handleInlineCountryChange(customer.id, e.target.value)}
                                    >
                                      {nationalities.map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                    <select
                                      className="select-sm"
                                      value={customer.managerName}
                                      onChange={(e) => handleInlineManagerChange(customer.id, e.target.value)}
                                    >
                                      {managers.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
                                    </select>
                                    <button className="btn-save" onClick={() => handleSaveRow(customer.id)}>
                                      저장
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Smooth Pagination Navigation Bar */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', padding: '16px 24px', backgroundColor: '#fff', borderTop: '1px solid #e2e8f0', marginTop: '12px', borderRadius: '8px' }}>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    style={{ padding: '8px 18px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: currentPage === 1 ? '#f8fafc' : '#fff', color: currentPage === 1 ? '#94a3b8' : '#0284c7', fontWeight: 600, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                  >
                    ◀ 이전 페이지
                  </button>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: '#334155' }}>
                    <span style={{ color: '#0284c7', fontWeight: 700, fontSize: '16px' }}>{currentPage}</span> / {totalPages} 페이지 (총 {filteredCustomers.length.toLocaleString()}건 중 50건씩 표시)
                  </span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    style={{ padding: '8px 18px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: currentPage >= totalPages ? '#f8fafc' : '#fff', color: currentPage >= totalPages ? '#94a3b8' : '#0284c7', fontWeight: 600, cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer' }}
                  >
                    다음 페이지 ▶
                  </button>
                </div>

                {isFilterModalOpen && (
                  <div className="modal-backdrop" onClick={() => setIsFilterModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                      <div className="modal-header">
                        <h3>상세 필터 검색</h3>
                        <button className="btn-close" onClick={() => setIsFilterModalOpen(false)}><X size={18} /></button>
                      </div>
                      <div className="modal-body">
                        <div className="form-group">
                          <label>국적 선택</label>
                          <select className="form-control" value={selectedNationality} onChange={(e) => setSelectedNationality(e.target.value)}>
                            <option value="">전체 국적</option>
                            {nationalities.map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>환급처리상태</label>
                          <select className="form-control" value={selectedRefundStatus} onChange={(e) => setSelectedRefundStatus(e.target.value)}>
                            <option value="">전체 상태</option>
                            {refundStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="modal-footer">
                        <button className="btn-cancel" onClick={handleResetFilters}>필터 초기화</button>
                        <button className="btn-submit" onClick={() => setIsFilterModalOpen(false)}>필터 적용</button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 2. Complex New Registration & Detail Page (Matching the exact PDF and yearly tables in screenshot) */}
            {currentView === 'registration' && (
              <div className="view-container" style={{ backgroundColor: '#ffffff', padding: '20px' }}>
                {/* Registration Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0f172a', paddingBottom: '12px', marginBottom: '20px' }}>
                  <div>
                    <h1 style={{ fontSize: '22px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', margin: 0 }}>
                      고객등록 관리
                      <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#ef4444' }}>고객정보 및 근로소득 원천징수영수증을 등록, 관리하고 환급 가능한 세액을 계산합니다.</span>
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                      <span style={{ backgroundColor: '#2563eb', color: '#ffffff', padding: '3px 10px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold', display: 'inline-block' }}>
                        {regForm.nationality || '미얀마'}팀 {regForm.managerName || 'Boram'}
                      </span>
                      <span style={{ color: '#94a3b8', fontWeight: 'bold' }}>|</span>
                      <span style={{ backgroundColor: '#1e293b', color: '#ffffff', padding: '3px 10px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold', display: 'inline-block' }}>
                        최종업데이트 : {(() => {
                          const now = new Date();
                          const year = now.getFullYear();
                          const month = now.getMonth() + 1;
                          const date = now.getDate();
                          let hours = now.getHours();
                          const minutes = String(now.getMinutes()).padStart(2, '0');
                          const ampm = hours >= 12 ? '오후' : '오전';
                          hours = hours % 12;
                          hours = hours ? hours : 12;
                          return `${year}년 ${month}월 ${date}일 ${ampm} ${hours}:${minutes}`;
                        })()}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-cancel" style={{ padding: '6px 14px', fontSize: '13px', backgroundColor: '#ffffff', color: '#1e293b', border: '1px solid #cbd5e1', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }} onClick={handleResetAll}>전체 초기화</button>
                    <button className="btn-submit" style={{ padding: '6px 16px', fontSize: '13px', backgroundColor: '#2563eb', color: 'white', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }} onClick={handleSaveRegistration}>신규저장</button>
                    <button className="btn-cancel" style={{ padding: '6px 14px', fontSize: '13px', backgroundColor: '#ef4444', color: 'white', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setCurrentView('customer')}>삭제</button>
                    <button className="btn-cancel" style={{ padding: '6px 14px', fontSize: '13px', backgroundColor: '#ffffff', color: '#1e293b', border: '1px solid #cbd5e1', fontWeight: 'bold', borderRadius: '4px', cursor: 'pointer' }} onClick={() => setCurrentView('customer')}>목록</button>
                  </div>
                </div>

                {/* Form Group 1: Basic Information Input Grid (Light Blue Header Style, Table format for perfect alignment) */}
                <div style={{ overflowX: 'auto', marginBottom: '20px', border: '1px solid #cbd5e1' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '1000px', backgroundColor: '#ffffff' }}>
                    <tbody>
                      {/* Row 1 Header */}
                      <tr style={{ backgroundColor: '#bae6fd', color: '#0369a1', fontWeight: 'bold', fontSize: '13px', textAlign: 'center' }}>
                        <td style={{ border: '1px solid #cbd5e1', padding: '6px', width: '8%' }}>신청인</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '6px', width: '11%' }}>외국인 등록번호</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '6px', width: '8%' }}>국적</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '6px', width: '13%' }}>전화번호</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '6px', width: '7%' }}>비자 종류</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '6px', width: '9%' }}>
                          {(regForm.years['2023']?.workPlace || regForm.years['2024']?.workPlace || regForm.years['2022']?.workPlace) 
                            ? `${regForm.years['2023']?.workPlace || regForm.years['2024']?.workPlace || regForm.years['2022']?.workPlace} 취업일` 
                            : '취업일'}
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '6px', width: '9%' }}>비자만료일</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '6px', width: '7%' }}>월세여부</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '6px', width: '18%' }}>환급금 입금계좌</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '6px', width: '10%' }}>환급처리상태</td>
                      </tr>
                      {/* Row 1 Inputs */}
                      <tr>
                        <td style={{ border: '1px solid #cbd5e1', padding: '4px' }}>
                          <input type="text" className="form-control" style={{ fontSize: '13px', height: '32px' }} value={regForm.name} onChange={(e) => setRegForm(prev => ({ ...prev, name: e.target.value }))} placeholder="이름 입력" />
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '4px' }}>
                          <input type="text" className="form-control" style={{ fontSize: '13px', height: '32px' }} value={regForm.foreignerNumber} onChange={(e) => setRegForm(prev => ({ ...prev, foreignerNumber: e.target.value }))} placeholder="890528-5580013" />
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '4px' }}>
                          <select className="form-control" style={{ fontSize: '13px', height: '32px', padding: '2px' }} value={regForm.nationality} onChange={(e) => setRegForm(prev => ({ ...prev, nationality: e.target.value }))}>
                            {nationalities.map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '4px' }}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <select
                              className="form-control"
                              style={{ fontSize: '13px', height: '32px', padding: '2px', width: '65px', flexShrink: 0 }}
                              value={regForm.telecom || 'SKT'}
                              onChange={(e) => setRegForm(prev => ({ ...prev, telecom: e.target.value }))}
                            >
                              <option value="SKT">SKT</option>
                              <option value="KT">KT</option>
                              <option value="LGU+">LGU+</option>
                              <option value="알뜰폰">알뜰폰</option>
                              <option value="기타">기타</option>
                            </select>
                            <input
                              type="text"
                              className="form-control"
                              style={{ fontSize: '13px', height: '32px', flexGrow: 1 }}
                              value={regForm.phone}
                              onChange={(e) => setRegForm(prev => ({ ...prev, phone: e.target.value }))}
                              placeholder="010-XXXX-XXXX"
                            />
                          </div>
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '4px' }}>
                          <select className="form-control" style={{ fontSize: '13px', height: '32px', padding: '2px' }} value={regForm.visaType} onChange={(e) => setRegForm(prev => ({ ...prev, visaType: e.target.value }))}>
                            {visaTypes.map(v => <option key={v} value={v}>{v}</option>)}
                          </select>
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '4px' }}>
                          <input type="date" className="form-control" style={{ fontSize: '13px', height: '32px', padding: '2px' }} value={regForm.residentAddress} onChange={(e) => setRegForm(prev => ({ ...prev, residentAddress: e.target.value }))} />
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '4px' }}>
                          <input type="date" className="form-control" style={{ fontSize: '13px', height: '32px', padding: '2px' }} value={regForm.visaExpiry} onChange={(e) => setRegForm(prev => ({ ...prev, visaExpiry: e.target.value }))} />
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '4px' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', fontSize: '13px', height: '32px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>
                              <input type="radio" name="isMonthlyRent" checked={regForm.isMonthlyRent === '가'} onChange={() => setRegForm(prev => ({ ...prev, isMonthlyRent: '가' }))} /> 가
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>
                              <input type="radio" name="isMonthlyRent" checked={regForm.isMonthlyRent === '부'} onChange={() => setRegForm(prev => ({ ...prev, isMonthlyRent: '부' }))} /> 부
                            </label>
                          </div>
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '4px' }}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <select
                              className="form-control"
                              style={{ fontSize: '13px', height: '32px', padding: '2px', width: '95px', flexShrink: 0 }}
                              value={regForm.refundBankName || 'KB국민은행'}
                              onChange={(e) => setRegForm(prev => ({ ...prev, refundBankName: e.target.value }))}
                            >
                              {bankList.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                            <input
                              type="text"
                              className="form-control"
                              style={{ fontSize: '13px', height: '32px', flexGrow: 1 }}
                              value={regForm.refundBank}
                              onChange={(e) => setRegForm(prev => ({ ...prev, refundBank: e.target.value }))}
                              placeholder="계좌번호 입력"
                            />
                          </div>
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '4px' }}>
                          <select className="form-control" style={{ fontSize: '13px', height: '32px', padding: '2px' }} value={regForm.refundStatus} onChange={(e) => setRegForm(prev => ({ ...prev, refundStatus: e.target.value }))}>
                            {refundStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>

                      {/* Row 2 Header */}
                      <tr style={{ backgroundColor: '#bae6fd', color: '#0369a1', fontWeight: 'bold', fontSize: '13px', textAlign: 'center' }}>
                        <td colSpan={2} style={{ border: '1px solid #cbd5e1', padding: '6px' }}>주민등록상 주소지</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>감면명세서 제출상태</td>
                        <td colSpan={2} style={{ border: '1px solid #cbd5e1', padding: '6px' }}>기존 감면명세서 적용기간</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>감면명세서 발송일</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>경정청구일</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>추가환급 여부</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>추가 신청예정일</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '6px' }}>수수료수납선택</td>
                      </tr>
                      {/* Row 2 Inputs */}
                      <tr>
                        <td colSpan={2} style={{ border: '1px solid #cbd5e1', padding: '4px' }}>
                          <input type="text" className="form-control" style={{ fontSize: '13px', height: '32px' }} value={regForm.residentRegisterAddress} onChange={(e) => setRegForm(prev => ({ ...prev, residentRegisterAddress: e.target.value }))} placeholder="주소지 도로명 주소" />
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '4px' }}>
                          <select className="form-control" style={{ fontSize: '13px', height: '32px', padding: '2px' }} value={regForm.deductionSubmissionStatus} onChange={(e) => setRegForm(prev => ({ ...prev, deductionSubmissionStatus: e.target.value }))}>
                            {submissionStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td colSpan={2} style={{ border: '1px solid #cbd5e1', padding: '4px' }}>
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <input type="date" className="form-control" style={{ fontSize: '12px', height: '32px', padding: '2px' }} />
                            <span style={{ fontSize: '12px' }}>~</span>
                            <input type="date" className="form-control" style={{ fontSize: '12px', height: '32px', padding: '2px' }} />
                          </div>
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '4px' }}>
                          <input type="date" className="form-control" style={{ fontSize: '13px', height: '32px', padding: '2px' }} value={regForm.deductionSentDate} onChange={(e) => setRegForm(prev => ({ ...prev, deductionSentDate: e.target.value }))} />
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '4px' }}>
                          <input type="date" className="form-control" style={{ fontSize: '13px', height: '32px', padding: '2px' }} value={regForm.claimCompleteDate} onChange={(e) => setRegForm(prev => ({ ...prev, claimCompleteDate: e.target.value }))} />
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '4px' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', fontSize: '13px', height: '32px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>
                              <input type="radio" name="addRefund" checked={regForm.additionalApplyPerformance === '가'} onChange={() => setRegForm(prev => ({ ...prev, additionalApplyPerformance: '가' }))} /> 가
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '2px', cursor: 'pointer' }}>
                              <input type="radio" name="addRefund" checked={regForm.additionalApplyPerformance !== '가'} onChange={() => setRegForm(prev => ({ ...prev, additionalApplyPerformance: '부' }))} /> 부
                            </label>
                          </div>
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '4px' }}>
                          <input type="date" className="form-control" style={{ fontSize: '13px', height: '32px', padding: '2px' }} value={regForm.claimRequestDate} onChange={(e) => setRegForm(prev => ({ ...prev, claimRequestDate: e.target.value }))} />
                        </td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '4px' }}>
                          <select className="form-control" style={{ fontSize: '13px', height: '32px', padding: '2px' }} value={regForm.feePaymentStatus} onChange={(e) => setRegForm(prev => ({ ...prev, feePaymentStatus: e.target.value }))}>
                            <option value="후불 22%">후불 22%</option>
                            <option value="선불 17%">선불 17%</option>
                            <option value="선불10%, 후불10%">선불10%, 후불10%</option>
                          </select>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                 {/* Yearly Detailed Calculation Grid (Matching screenshot color themes: light blue headers, yellow highlights, zebra grid) */}
                <div style={{ overflowX: 'auto', marginBottom: '20px', border: '1px solid #cbd5e1' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '1100px' }}>
                    <thead>
                      {/* Year columns header */}
                      <tr style={{ backgroundColor: '#bae6fd', color: '#0369a1', fontWeight: 'bold', textAlign: 'center' }}>
                        <th colSpan={2} style={{ width: '220px', border: '1px solid #cbd5e1', padding: '8px', position: 'relative' }}>
                          연도별 정산 연도
                          <button
                            type="button"
                            onClick={handleAddYear}
                            style={{
                              position: 'absolute',
                              right: '8px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              padding: '2px 6px',
                              fontSize: '12px',
                              backgroundColor: '#0284c7',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px',
                              border: 'none',
                              borderRadius: '4px',
                              color: '#fff',
                              cursor: 'pointer',
                              fontWeight: 'normal'
                            }}
                          >
                            <Plus size={12} /> 연도 추가
                          </button>
                        </th>
                        {targetYears.map(yr => (
                          <th key={yr} style={{ border: '1px solid #cbd5e1', padding: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                              <span>{yr}년도</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveYear(yr)}
                                style={{
                                  border: 'none',
                                  background: 'none',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  padding: 0,
                                  fontSize: '12px',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                                title="연도 삭제"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </th>
                        ))}
                        <th style={{ border: '1px solid #cbd5e1', padding: '8px', width: '120px' }}>합계금액</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* PDF File Selection Row */}
                      <tr style={{ backgroundColor: '#fef08a' }}>
                        <td colSpan={2} style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: 'bold', textAlign: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <span>PDF파일 선택</span>
                            <label style={{
                              padding: '3px 8px',
                              fontSize: '11px',
                              backgroundColor: '#2563eb',
                              color: 'white',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: 'bold',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                            }}>
                              <FileSpreadsheet size={12} />
                              📁 PDF 5개 한꺼번에 자동분석
                              <input 
                                type="file" 
                                accept=".pdf" 
                                multiple
                                style={{ display: 'none' }} 
                                onChange={handleBulkPdfUpload} 
                              />
                            </label>
                          </div>
                        </td>
                        {targetYears.map(yr => (
                          <td key={yr} style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'center' }}>
                              {regForm.years[yr]?.isFileUploaded ? (
                                <button
                                  type="button"
                                  onClick={() => handleDownloadPdf(yr)}
                                  style={{
                                    backgroundColor: '#15803d',
                                    color: '#ffffff',
                                    fontWeight: 'bold',
                                    fontSize: '11px',
                                    padding: '4px 14px',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                  }}
                                >
                                  다운로드
                                </button>
                              ) : (
                                <input 
                                  type="file" 
                                  accept=".pdf" 
                                  multiple
                                  style={{ fontSize: '12px', width: '150px' }} 
                                  onChange={(e) => handleSingleYearPdfUpload(e, yr)} 
                                />
                              )}
                            </div>
                          </td>
                        ))}
                        <td style={{ border: '1px solid #cbd5e1', backgroundColor: '#e2e8f0' }}></td>
                      </tr>

                      {/* Work Details Row Group */}
                      <tr>
                        <td colSpan={2} style={{ border: '1px solid #cbd5e1', padding: '6px', backgroundColor: '#f8fafc', fontWeight: 'bold', textAlign: 'center' }}>적용연도</td>
                        {targetYears.map(yr => <td key={yr} style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center' }}>{yr}</td>)}
                        <td style={{ border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9' }}></td>
                      </tr>
                      <tr>
                        <td colSpan={2} style={{ border: '1px solid #cbd5e1', padding: '6px', backgroundColor: '#f8fafc', fontWeight: 'bold', textAlign: 'center' }}>근무기간</td>
                        {targetYears.map(yr => (
                          <td key={yr} style={{ border: '1px solid #cbd5e1', padding: '2px' }}>
                            <input
                              type="text"
                              className="form-control"
                              style={{ height: '28px', fontSize: '12px', textAlign: 'center' }}
                              value={regForm.years[yr]?.workPeriod || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setRegForm(prev => ({ ...prev, years: { ...prev.years, [yr]: { ...prev.years[yr], workPeriod: val } } }));
                              }}
                              placeholder="-"
                            />
                          </td>
                        ))}
                        <td style={{ border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9' }}></td>
                      </tr>
                      <tr>
                        <td colSpan={2} style={{ border: '1px solid #cbd5e1', padding: '6px', backgroundColor: '#f8fafc', fontWeight: 'bold', textAlign: 'center' }}>근무처명</td>
                        {targetYears.map(yr => (
                          <td key={yr} style={{ border: '1px solid #cbd5e1', padding: '2px' }}>
                            <input
                              type="text"
                              className="form-control"
                              style={{ height: '28px', fontSize: '12px', textAlign: 'center' }}
                              value={regForm.years[yr]?.workPlace || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setRegForm(prev => ({ ...prev, years: { ...prev.years, [yr]: { ...prev.years[yr], workPlace: val } } }));
                              }}
                              placeholder="-"
                            />
                          </td>
                        ))}
                        <td style={{ border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9' }}></td>
                      </tr>
                      <tr>
                        <td colSpan={2} style={{ border: '1px solid #cbd5e1', padding: '6px', backgroundColor: '#f8fafc', fontWeight: 'bold', textAlign: 'center' }}>사업자등록번호</td>
                        {targetYears.map(yr => (
                          <td key={yr} style={{ border: '1px solid #cbd5e1', padding: '2px' }}>
                            <input
                              type="text"
                              className="form-control"
                              style={{ height: '28px', fontSize: '12px', textAlign: 'center' }}
                              value={regForm.years[yr]?.businessNumber || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setRegForm(prev => ({ ...prev, years: { ...prev.years, [yr]: { ...prev.years[yr], businessNumber: val } } }));
                              }}
                              placeholder="-"
                            />
                          </td>
                        ))}
                        <td style={{ border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9' }}></td>
                      </tr>
                      <tr>
                        <td colSpan={2} style={{ border: '1px solid #cbd5e1', padding: '6px', backgroundColor: '#f8fafc', fontWeight: 'bold', textAlign: 'center' }}>생년월일</td>
                        {targetYears.map(yr => (
                          <td key={yr} style={{ border: '1px solid #cbd5e1', padding: '2px' }}>
                            <input
                              type="text"
                              className="form-control"
                              style={{ height: '28px', fontSize: '12px', textAlign: 'center' }}
                              value={regForm.years[yr]?.birthDate || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setRegForm(prev => ({ ...prev, years: { ...prev.years, [yr]: { ...prev.years[yr], birthDate: val } } }));
                              }}
                              placeholder="-"
                            />
                          </td>
                        ))}
                        <td style={{ border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9' }}></td>
                      </tr>

                      {/* Financial values (Zebra rows, light purple headers on left) */}
                      {/* 1. 급여 -> 총급여, 계 */}
                      <tr style={{ backgroundColor: '#faf5ff' }}>
                        <td rowSpan={2} style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: 'bold', textAlign: 'center', color: '#7e22ce', backgroundColor: '#f3e8ff', verticalAlign: 'middle' }}>급여</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: 'bold', textAlign: 'center', color: '#7e22ce', backgroundColor: '#faf5ff' }}>총급여</td>
                        {targetYears.map(yr => (
                          <td key={yr} style={{ border: '1px solid #cbd5e1', padding: '2px' }}>
                            <input
                              type="number"
                              className="form-control"
                              style={{ height: '28px', fontSize: '12px', textAlign: 'right' }}
                              value={regForm.years[yr]?.active ? regForm.years[yr]?.salaryTotal || '0' : ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setRegForm(prev => ({ ...prev, years: { ...prev.years, [yr]: { ...prev.years[yr], salaryTotal: val, active: true } } }));
                              }}
                              placeholder="-"
                            />
                          </td>
                        ))}
                        <td style={{ border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold', padding: '4px', backgroundColor: '#f3e8ff' }}>
                          {targetYears.reduce((sum, yr) => sum + (regForm.years[yr]?.active ? Number(regForm.years[yr]?.salaryTotal) || 0 : 0), 0).toLocaleString()}
                        </td>
                      </tr>
                      <tr style={{ backgroundColor: '#faf5ff' }}>
                        <td style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: 'bold', textAlign: 'center', color: '#7e22ce', backgroundColor: '#faf5ff' }}>계</td>
                        {targetYears.map(yr => (
                          <td key={yr} style={{ border: '1px solid #cbd5e1', padding: '2px' }}>
                            <input
                              type="number"
                              className="form-control"
                              style={{ height: '28px', fontSize: '12px', textAlign: 'right' }}
                              value={regForm.years[yr]?.active ? regForm.years[yr]?.salaryTotal || '0' : ''}
                              placeholder="-"
                              readOnly
                            />
                          </td>
                        ))}
                        <td style={{ border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold', padding: '4px', backgroundColor: '#f3e8ff' }}>
                          {targetYears.reduce((sum, yr) => sum + (regForm.years[yr]?.active ? Number(regForm.years[yr]?.salaryTotal) || 0 : 0), 0).toLocaleString()}
                        </td>
                      </tr>

                      {/* 2. 과세표준 -> 산출세액 */}
                      <tr>
                        <td style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f8fafc' }}>과세표준</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: 'bold', textAlign: 'center' }}>산출세액</td>
                        {targetYears.map(yr => (
                          <td key={yr} style={{ border: '1px solid #cbd5e1', padding: '2px' }}>
                            <input
                              type="number"
                              className="form-control"
                              style={{ height: '28px', fontSize: '12px', textAlign: 'right' }}
                              value={regForm.years[yr]?.active ? regForm.years[yr]?.taxBase || '0' : ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setRegForm(prev => ({ ...prev, years: { ...prev.years, [yr]: { ...prev.years[yr], taxBase: val, active: true } } }));
                              }}
                              placeholder="-"
                            />
                          </td>
                        ))}
                        <td style={{ border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold', padding: '4px' }}>
                          {targetYears.reduce((sum, yr) => sum + (regForm.years[yr]?.active ? Number(regForm.years[yr]?.taxBase) || 0 : 0), 0).toLocaleString()}
                        </td>
                      </tr>

                      {/* 3. 세액감면 -> 중소기업 청년 세액감면 */}
                      <tr style={{ backgroundColor: '#faf5ff' }}>
                        <td style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: 'bold', textAlign: 'center', color: '#7e22ce', backgroundColor: '#f3e8ff' }}>세액감면</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: 'bold', textAlign: 'center', color: '#7e22ce', backgroundColor: '#faf5ff' }}>중소기업 청년 세액감면</td>
                        {targetYears.map(yr => (
                          <td key={yr} style={{ border: '1px solid #cbd5e1', padding: '2px' }}>
                            <input
                              type="number"
                              className="form-control"
                              style={{ height: '28px', fontSize: '12px', textAlign: 'right' }}
                              value={regForm.years[yr]?.active ? regForm.years[yr]?.childReduction || '0' : ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setRegForm(prev => ({ ...prev, years: { ...prev.years, [yr]: { ...prev.years[yr], childReduction: val, active: true } } }));
                              }}
                              placeholder="-"
                            />
                          </td>
                        ))}
                        <td style={{ border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold', padding: '4px', backgroundColor: '#f3e8ff' }}>
                          {targetYears.reduce((sum, yr) => sum + (regForm.years[yr]?.active ? Number(regForm.years[yr]?.childReduction) || 0 : 0), 0).toLocaleString()}
                        </td>
                      </tr>

                      {/* 4. 세액공제 -> 근로소득 세액공제 */}
                      <tr>
                        <td style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f8fafc' }}>세액공제</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: 'bold', textAlign: 'center' }}>근로소득 세액공제</td>
                        {targetYears.map(yr => (
                          <td key={yr} style={{ border: '1px solid #cbd5e1', padding: '2px' }}>
                            <input
                              type="number"
                              className="form-control"
                              style={{ height: '28px', fontSize: '12px', textAlign: 'right' }}
                              value={regForm.years[yr]?.active ? regForm.years[yr]?.childDeduction || '0' : ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setRegForm(prev => ({ ...prev, years: { ...prev.years, [yr]: { ...prev.years[yr], childDeduction: val, active: true } } }));
                              }}
                              placeholder="-"
                            />
                          </td>
                        ))}
                        <td style={{ border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold', padding: '4px' }}>
                          {targetYears.reduce((sum, yr) => sum + (regForm.years[yr]?.active ? Number(regForm.years[yr]?.childDeduction) || 0 : 0), 0).toLocaleString()}
                        </td>
                      </tr>

                      {/* 5. 결정세액 */}
                      <tr style={{ backgroundColor: '#faf5ff' }}>
                        <td colSpan={2} style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: 'bold', textAlign: 'center', color: '#7e22ce', backgroundColor: '#faf5ff' }}>결정세액</td>
                        {targetYears.map(yr => (
                          <td key={yr} style={{ border: '1px solid #cbd5e1', padding: '2px' }}>
                            <input
                              type="number"
                              className="form-control"
                              style={{ height: '28px', fontSize: '12px', textAlign: 'right' }}
                              value={regForm.years[yr]?.active ? regForm.years[yr]?.decisionTax || '0' : ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setRegForm(prev => ({ ...prev, years: { ...prev.years, [yr]: { ...prev.years[yr], decisionTax: val, active: true } } }));
                              }}
                              placeholder="-"
                            />
                          </td>
                        ))}
                        <td style={{ border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold', padding: '4px', backgroundColor: '#f3e8ff' }}>
                          {targetYears.reduce((sum, yr) => sum + (regForm.years[yr]?.active ? Number(regForm.years[yr]?.decisionTax) || 0 : 0), 0).toLocaleString()}
                        </td>
                      </tr>

                      {/* 6. 지방세 */}
                      <tr>
                        <td colSpan={2} style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: 'bold', textAlign: 'center' }}>지방세</td>
                        {targetYears.map(yr => (
                          <td key={yr} style={{ border: '1px solid #cbd5e1', padding: '2px' }}>
                            <input
                              type="number"
                              className="form-control"
                              style={{ height: '28px', fontSize: '12px', textAlign: 'right' }}
                              value={regForm.years[yr]?.active ? regForm.years[yr]?.localTax || '0' : ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setRegForm(prev => ({ ...prev, years: { ...prev.years, [yr]: { ...prev.years[yr], localTax: val, active: true } } }));
                              }}
                              placeholder="-"
                            />
                          </td>
                        ))}
                        <td style={{ border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold', padding: '4px' }}>
                          {targetYears.reduce((sum, yr) => sum + (regForm.years[yr]?.active ? Number(regForm.years[yr]?.localTax) || 0 : 0), 0).toLocaleString()}
                        </td>
                      </tr>

                      {/* 7. 세액합계금액 */}
                      <tr style={{ backgroundColor: '#faf5ff' }}>
                        <td colSpan={2} style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: 'bold', textAlign: 'center', color: '#7e22ce', backgroundColor: '#faf5ff' }}>세액합계금액</td>
                        {targetYears.map(yr => (
                          <td key={yr} style={{ border: '1px solid #cbd5e1', padding: '2px' }}>
                            <input
                              type="number"
                              className="form-control"
                              style={{ height: '28px', fontSize: '12px', textAlign: 'right' }}
                              value={regForm.years[yr]?.active ? regForm.years[yr]?.taxRefundTotal || '0' : ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setRegForm(prev => ({ ...prev, years: { ...prev.years, [yr]: { ...prev.years[yr], taxRefundTotal: val, active: true } } }));
                              }}
                              placeholder="-"
                            />
                          </td>
                        ))}
                        <td style={{ border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold', padding: '4px', backgroundColor: '#f3e8ff' }}>
                          {targetYears.reduce((sum, yr) => sum + (regForm.years[yr]?.active ? Number(regForm.years[yr]?.taxRefundTotal) || 0 : 0), 0).toLocaleString()}
                        </td>
                      </tr>

                      {/* 8. 중소기업 청년 세액감면 적용 (Layout matches user's screenshot) */}
                      {/* Row 1: 중소기업 청년 세액감면 적용 */}
                      <tr>
                        <td colSpan={2} style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#e0f2fe', color: '#0369a1' }}>중소기업 청년 세액감면 적용</td>
                        {targetYears.map(yr => {
                          const yearData = regForm.years[yr];
                          const isFileUploaded = Boolean(yearData?.isFileUploaded);
                          const applyVal = yearData?.childReductionApply;
                          const isApplied = Boolean(
                            applyVal !== 'N' && 
                            applyVal !== '0' && 
                            (applyVal === 'Y' || applyVal === '90%' || Number(yearData?.childReductionApplyAmt) > 0)
                          );

                          return (
                            <td 
                              key={yr} 
                              style={{ border: '1px solid #cbd5e1', padding: isFileUploaded ? '6px' : '2px', textAlign: 'center', cursor: 'pointer', userSelect: 'none' }}
                              onClick={() => {
                                if (isFileUploaded) {
                                  setRegForm(prev => ({
                                    ...prev,
                                    years: {
                                      ...prev.years,
                                      [yr]: {
                                        ...prev.years[yr],
                                        childReductionApply: isApplied ? 'N' : 'Y'
                                      }
                                    }
                                  }));
                                }
                              }}
                            >
                              {!isFileUploaded ? (
                                <input
                                  type="text"
                                  className="form-control"
                                  style={{ height: '28px', fontSize: '12px', textAlign: 'center' }}
                                  value={(!yearData?.childReductionApply || yearData?.childReductionApply === '0') ? '90%' : yearData?.childReductionApply}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setRegForm(prev => ({
                                      ...prev,
                                      years: {
                                        ...prev.years,
                                        [yr]: {
                                          ...prev.years[yr],
                                          childReductionApply: val
                                        }
                                      }
                                    }));
                                  }}
                                  placeholder="90%"
                                />
                              ) : isApplied ? (
                                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="11" cy="11" r="10" fill="#22c55e"/>
                                    <path d="M7 11.2L9.8 14L15 8.2" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </div>
                              ) : (
                                <span style={{ color: '#64748b', fontWeight: 'normal' }}>-</span>
                              )}
                            </td>
                          );
                        })}
                        <td style={{ border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9' }}></td>
                      </tr>

                      {/* Row 2: 세액감면 (spans 1 row) & 중소기업 청년 세액감면 */}
                      <tr>
                        <td style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#e0f2fe', color: '#0369a1', width: '120px' }}>세액감면</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f8fafc' }}>중소기업 청년 세액감면</td>
                        {targetYears.map(yr => (
                          <td key={yr} style={{ border: '1px solid #cbd5e1', padding: '2px' }}>
                            <input
                              type="number"
                              className="form-control"
                              style={{ height: '28px', fontSize: '12px', textAlign: 'right' }}
                              value={regForm.years[yr]?.active ? regForm.years[yr]?.childReductionApplyAmt || '0' : ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setRegForm(prev => ({ ...prev, years: { ...prev.years, [yr]: { ...prev.years[yr], childReductionApplyAmt: val, active: true } } }));
                              }}
                              placeholder="-"
                            />
                          </td>
                        ))}
                        <td style={{ border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold', padding: '4px', backgroundColor: '#f1f5f9' }}>
                          {targetYears.reduce((sum, yr) => sum + (regForm.years[yr]?.active ? Number(regForm.years[yr]?.childReductionApplyAmt) || 0 : 0), 0).toLocaleString()}
                        </td>
                      </tr>

                      {/* Row 3: 세액공제 (spans 2 rows vertically) & 근로소득 세액공제(변경) */}
                      <tr>
                        <td rowSpan={2} style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#e0f2fe', color: '#0369a1', verticalAlign: 'middle' }}>세액공제</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f8fafc' }}>근로소득 세액공제(변경)</td>
                        {targetYears.map(yr => (
                          <td key={yr} style={{ border: '1px solid #cbd5e1', padding: '2px' }}>
                            <input
                              type="number"
                              className="form-control"
                              style={{ height: '28px', fontSize: '12px', textAlign: 'right' }}
                              value={regForm.years[yr]?.active ? regForm.years[yr]?.childDeductionApplyAmt || '0' : ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setRegForm(prev => ({ ...prev, years: { ...prev.years, [yr]: { ...prev.years[yr], childDeductionApplyAmt: val, active: true } } }));
                              }}
                              placeholder="-"
                            />
                          </td>
                        ))}
                        <td style={{ border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold', padding: '4px', backgroundColor: '#f1f5f9' }}>
                          {targetYears.reduce((sum, yr) => sum + (regForm.years[yr]?.active ? Number(regForm.years[yr]?.childDeductionApplyAmt) || 0 : 0), 0).toLocaleString()}
                        </td>
                      </tr>

                      {/* Row 4: 결정세액(변경) (No left header column, spans next to Row 3's 세액공제) */}
                      <tr>
                        <td style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#f8fafc' }}>결정세액(변경)</td>
                        {targetYears.map(yr => (
                          <td key={yr} style={{ border: '1px solid #cbd5e1', padding: '2px' }}>
                            <input
                              type="number"
                              className="form-control"
                              style={{ height: '28px', fontSize: '12px', textAlign: 'right' }}
                              value={regForm.years[yr]?.active ? regForm.years[yr]?.decisionTaxApplyAmt || '0' : ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setRegForm(prev => ({ ...prev, years: { ...prev.years, [yr]: { ...prev.years[yr], decisionTaxApplyAmt: val, active: true } } }));
                              }}
                              placeholder="-"
                            />
                          </td>
                        ))}
                        <td style={{ border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold', padding: '4px', backgroundColor: '#f1f5f9' }}>
                          {targetYears.reduce((sum, yr) => sum + (regForm.years[yr]?.active ? Number(regForm.years[yr]?.decisionTaxApplyAmt) || 0 : 0), 0).toLocaleString()}
                        </td>
                      </tr>

                      {/* Row 5: 지방세액(변경) (header spans 2 columns horizontally) */}
                      <tr>
                        <td colSpan={2} style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#e0f2fe', color: '#0369a1' }}>지방세액(변경)</td>
                        {targetYears.map(yr => (
                          <td key={yr} style={{ border: '1px solid #cbd5e1', padding: '2px' }}>
                            <input
                              type="number"
                              className="form-control"
                              style={{ height: '28px', fontSize: '12px', textAlign: 'right' }}
                              value={regForm.years[yr]?.active ? regForm.years[yr]?.localTaxApplyAmt || '0' : ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setRegForm(prev => ({ ...prev, years: { ...prev.years, [yr]: { ...prev.years[yr], localTaxApplyAmt: val, active: true } } }));
                              }}
                              placeholder="-"
                            />
                          </td>
                        ))}
                        <td style={{ border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold', padding: '4px', backgroundColor: '#f1f5f9' }}>
                          {targetYears.reduce((sum, yr) => sum + (regForm.years[yr]?.active ? Number(regForm.years[yr]?.localTaxApplyAmt) || 0 : 0), 0).toLocaleString()}
                        </td>
                      </tr>

                      {/* Row 6: 세액합계금액(변경) (header spans 2 columns horizontally) */}
                      <tr>
                        <td colSpan={2} style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#e0f2fe', color: '#0369a1' }}>세액합계금액(변경)</td>
                        {targetYears.map(yr => (
                          <td key={yr} style={{ border: '1px solid #cbd5e1', padding: '2px' }}>
                            <input
                              type="number"
                              className="form-control"
                              style={{ height: '28px', fontSize: '12px', textAlign: 'right' }}
                              value={regForm.years[yr]?.active ? regForm.years[yr]?.decisionTaxRefundAmt || '0' : ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setRegForm(prev => ({ ...prev, years: { ...prev.years, [yr]: { ...prev.years[yr], decisionTaxRefundAmt: val, active: true } } }));
                              }}
                              placeholder="-"
                            />
                          </td>
                        ))}
                        <td style={{ border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold', padding: '4px', backgroundColor: '#f1f5f9' }}>
                          {targetYears.reduce((sum, yr) => sum + (regForm.years[yr]?.active ? Number(regForm.years[yr]?.decisionTaxRefundAmt) || 0 : 0), 0).toLocaleString()}
                        </td>
                      </tr>

                      {/* Expected Refund Section (Highlight Yellow Background Header Style on Left) */}
                      <tr style={{ backgroundColor: '#fef9c3' }}>
                        <td rowSpan={2} style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: 'bold', textAlign: 'center', color: '#854d0e', backgroundColor: '#fef08a', verticalAlign: 'middle' }}>환급예상금액</td>
                        <td style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: 'bold', textAlign: 'center', color: '#854d0e', backgroundColor: '#fef9c3' }}>국세환급금</td>
                        {targetYears.map(yr => (
                          <td key={yr} style={{ border: '1px solid #cbd5e1', padding: '2px' }}>
                            <input
                              type="number"
                              className="form-control"
                              style={{ height: '28px', fontSize: '12px', textAlign: 'right', backgroundColor: '#fffbeb' }}
                              value={regForm.years[yr]?.active ? regForm.years[yr]?.refundExpectNational || '0' : ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                const local = Number(regForm.years[yr]?.refundExpectLocal) || 0;
                                const newCourtFee = (Number(val) || 0) + local;
                                const newFee = Math.round(newCourtFee * (selectedFeeRate / 100));
                                setRegForm(prev => ({
                                  ...prev,
                                  years: {
                                    ...prev.years,
                                    [yr]: {
                                      ...prev.years[yr],
                                      refundExpectNational: val,
                                      courtFee: String(newCourtFee),
                                      expectedFeeAmt: String(newFee),
                                      active: true
                                    }
                                  }
                                }));
                              }}
                              placeholder="-"
                            />
                          </td>
                        ))}
                        <td style={{ border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold', padding: '4px', backgroundColor: '#fef08a' }}>
                          {targetYears.reduce((sum, yr) => sum + (regForm.years[yr]?.active ? Number(regForm.years[yr]?.refundExpectNational) || 0 : 0), 0).toLocaleString()}
                        </td>
                      </tr>
                      <tr style={{ backgroundColor: '#fef9c3' }}>
                        <td style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: 'bold', textAlign: 'center', color: '#854d0e', backgroundColor: '#fef9c3' }}>지방세 환급금</td>
                        {targetYears.map(yr => (
                          <td key={yr} style={{ border: '1px solid #cbd5e1', padding: '2px' }}>
                            <input
                              type="number"
                              className="form-control"
                              style={{ height: '28px', fontSize: '12px', textAlign: 'right', backgroundColor: '#fffbeb' }}
                              value={regForm.years[yr]?.active ? regForm.years[yr]?.refundExpectLocal || '0' : ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                const national = Number(regForm.years[yr]?.refundExpectNational) || 0;
                                const newCourtFee = national + (Number(val) || 0);
                                const newFee = Math.round(newCourtFee * (selectedFeeRate / 100));
                                setRegForm(prev => ({
                                  ...prev,
                                  years: {
                                    ...prev.years,
                                    [yr]: {
                                      ...prev.years[yr],
                                      refundExpectLocal: val,
                                      courtFee: String(newCourtFee),
                                      expectedFeeAmt: String(newFee),
                                      active: true
                                    }
                                  }
                                }));
                              }}
                              placeholder="-"
                            />
                          </td>
                        ))}
                        <td style={{ border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold', padding: '4px', backgroundColor: '#fef08a' }}>
                          {targetYears.reduce((sum, yr) => sum + (regForm.years[yr]?.active ? Number(regForm.years[yr]?.refundExpectLocal) || 0 : 0), 0).toLocaleString()}
                        </td>
                      </tr>
                      <tr style={{ backgroundColor: '#fef9c3' }}>
                        <td colSpan={2} style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: 'bold', textAlign: 'center', color: '#854d0e', backgroundColor: '#fef08a' }}>합계금액</td>
                        {targetYears.map(yr => (
                          <td key={yr} style={{ border: '1px solid #cbd5e1', padding: '2px' }}>
                            <input
                              type="number"
                              className="form-control"
                              style={{ height: '28px', fontSize: '12px', textAlign: 'right', backgroundColor: '#fffbeb' }}
                              value={regForm.years[yr]?.active ? regForm.years[yr]?.courtFee || '0' : ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                const newFee = Math.round((Number(val) || 0) * (selectedFeeRate / 100));
                                setRegForm(prev => ({
                                  ...prev,
                                  years: {
                                    ...prev.years,
                                    [yr]: {
                                      ...prev.years[yr],
                                      courtFee: val,
                                      expectedFeeAmt: String(newFee),
                                      active: true
                                    }
                                  }
                                }));
                              }}
                              placeholder="-"
                            />
                          </td>
                        ))}
                        <td style={{ border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold', padding: '4px', backgroundColor: '#fef08a' }}>
                          {targetYears.reduce((sum, yr) => sum + (regForm.years[yr]?.active ? Number(regForm.years[yr]?.courtFee) || 0 : 0), 0).toLocaleString()}
                        </td>
                      </tr>
                      <tr style={{ backgroundColor: '#fef9c3' }}>
                        <td colSpan={2} style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: 'bold', color: '#854d0e', backgroundColor: '#fef08a' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <span>예상수수료금액</span>
                            <select
                              value={selectedFeeRate}
                              onChange={(e) => handleFeeRateChange(Number(e.target.value))}
                              style={{
                                padding: '2px 4px',
                                fontSize: '12px',
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
                                backgroundColor: '#fff',
                                color: '#334155',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                height: '24px'
                              }}
                            >
                              {[30, 28, 26, 24, 22, 20, 19, 18, 17, 16, 15].map(pct => (
                                <option key={pct} value={pct}>{pct}%</option>
                              ))}
                            </select>
                          </div>
                        </td>
                        {targetYears.map(yr => (
                          <td key={yr} style={{ border: '1px solid #cbd5e1', padding: '2px' }}>
                            <input
                              type="number"
                              className="form-control"
                              style={{ height: '28px', fontSize: '12px', textAlign: 'right', backgroundColor: '#fffbeb' }}
                              value={regForm.years[yr]?.active ? regForm.years[yr]?.expectedFeeAmt || '0' : ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setRegForm(prev => ({ ...prev, years: { ...prev.years, [yr]: { ...prev.years[yr], expectedFeeAmt: val, active: true } } }));
                              }}
                              placeholder="-"
                            />
                          </td>
                        ))}
                        <td style={{ border: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 'bold', padding: '4px', backgroundColor: '#fef08a' }}>
                          {targetYears.reduce((sum, yr) => sum + (regForm.years[yr]?.active ? Number(regForm.years[yr]?.expectedFeeAmt) || 0 : 0), 0).toLocaleString()}
                        </td>
                      </tr>

                      {/* 세액재정정 경정 청구서 파일 row */}
                      <tr style={{ backgroundColor: '#fef08a' }}>
                        <td colSpan={2} style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#fef08a', color: '#854d0e' }}>
                          세액재정정 경정 청구서 파일
                        </td>
                        {targetYears.map(yr => (
                          <td key={yr} style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              <input 
                                type="file" 
                                style={{ fontSize: '12px', width: '150px' }} 
                              />
                            </div>
                          </td>
                        ))}
                        <td style={{ border: '1px solid #cbd5e1' }}></td>
                      </tr>

                      {/* PDF file attachment row at the very bottom */}
                      <tr style={{ backgroundColor: '#f1f5f9' }}>
                        <td colSpan={2} style={{ border: '1px solid #cbd5e1', padding: '6px', fontWeight: 'bold', textAlign: 'center' }}>세액결정 경정 청구서 파일</td>
                        {targetYears.map(yr => (
                          <td key={yr} style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'center' }}>
                              <input type="file" style={{ fontSize: '12px', width: '150px' }} />
                            </div>
                          </td>
                        ))}
                        <td style={{ border: '1px solid #cbd5e1' }}></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                 {/* Bottom Row split: Left Customer consultation details, Right Logs */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginTop: '20px' }}>
                  
                  {/* Left Column: 고객 상담 정보 관리 */}
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', backgroundColor: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#1e293b' }}>고객 상담 정보 관리</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button className="btn-cancel" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => setRegForm(prev => ({ ...prev, snsName: '', snsAddress: '', hometaxId: '', hometaxPw: '', consultMemo: '' }))}>초기화</button>
                        <button className="btn-submit" style={{ padding: '4px 12px', fontSize: '12px', backgroundColor: '#2563eb' }} onClick={() => showToast('상담 정보 임시 저장완료', 'success')}>저장</button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                      <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>페이스북명</label>
                        <input type="text" className="form-control" style={{ height: '32px', fontSize: '13px' }} value={regForm.snsName} onChange={(e) => setRegForm(prev => ({ ...prev, snsName: e.target.value }))} placeholder="SNS 닉네임" />
                      </div>
                      <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>페이스북주소</label>
                        <input type="text" className="form-control" style={{ height: '32px', fontSize: '13px' }} value={regForm.snsAddress} onChange={(e) => setRegForm(prev => ({ ...prev, snsAddress: e.target.value }))} placeholder="프로필 주소 URL" />
                      </div>
                      <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>홈택스 아이디</label>
                        <input type="text" className="form-control" style={{ height: '32px', fontSize: '13px' }} value={regForm.hometaxId} onChange={(e) => setRegForm(prev => ({ ...prev, hometaxId: e.target.value }))} />
                      </div>
                      <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>홈택스 비밀번호</label>
                        <input type="text" className="form-control" style={{ height: '32px', fontSize: '13px' }} value={regForm.hometaxPw} onChange={(e) => setRegForm(prev => ({ ...prev, hometaxPw: e.target.value }))} />
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>고객 관리등급</label>
                        <select className="form-control" style={{ height: '32px', fontSize: '13px', padding: '2px' }} value={regForm.customerGrade} onChange={(e) => setRegForm(prev => ({ ...prev, customerGrade: e.target.value }))}>
                          <option value="">선택하세요</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                          <option value="E">E</option>
                        </select>
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>녹취계약 일자</label>
                        <input type="date" className="form-control" style={{ height: '32px', fontSize: '13px', padding: '2px' }} value={regForm.greenContractDate} onChange={(e) => setRegForm(prev => ({ ...prev, greenContractDate: e.target.value }))} />
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>상담처리 메모</label>
                        <textarea className="form-control" style={{ height: '70px', fontSize: '13px', padding: '6px' }} value={regForm.consultMemo} onChange={(e) => setRegForm(prev => ({ ...prev, consultMemo: e.target.value }))} placeholder="상담 세부 정보를 기입하세요" />
                      </div>
                      
                      <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', margin: '4px 0' }}>
                        <button type="button" className="btn-submit" style={{ backgroundColor: '#10b981', fontSize: '13px', padding: '8px 16px' }} onClick={() => showToast('상담 내용 및 메모가 상담처리 로그에 등록되었습니다.', 'success')}>상담처리 등록</button>
                      </div>

                      <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>세금환급 실적</label>
                        <input type="number" className="form-control" style={{ height: '32px', fontSize: '13px' }} value={regForm.refundPerformance} onChange={(e) => setRegForm(prev => ({ ...prev, refundPerformance: e.target.value }))} />
                      </div>
                      <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>환급일자</label>
                        <input type="date" className="form-control" style={{ height: '32px', fontSize: '13px', padding: '2px' }} value={regForm.refundPerformanceDate} onChange={(e) => setRegForm(prev => ({ ...prev, refundPerformanceDate: e.target.value }))} />
                      </div>
                      <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>수수료 수납 실적</label>
                        <input type="number" className="form-control" style={{ height: '32px', fontSize: '13px' }} value={regForm.feeReceivedPerformance} onChange={(e) => setRegForm(prev => ({ ...prev, feeReceivedPerformance: e.target.value }))} />
                      </div>
                      <div>
                        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '2px' }}>수납일자</label>
                        <input type="date" className="form-control" style={{ height: '32px', fontSize: '13px', padding: '2px' }} value={regForm.feeReceivedDate} onChange={(e) => setRegForm(prev => ({ ...prev, feeReceivedDate: e.target.value }))} />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: 상담처리 로그 */}
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#1e293b', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                      상담처리 로그
                    </div>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#94a3b8', fontSize: '13px', border: '1px dashed #cbd5e1', borderRadius: '6px', minHeight: '200px' }}>
                      {regForm.consultMemo ? (
                        <div style={{ width: '100%', height: '100%', padding: '12px', color: '#334155', alignSelf: 'flex-start', textAlign: 'left', overflowY: 'auto' }}>
                          <div style={{ padding: '6px 8px', backgroundColor: '#f1f5f9', borderRadius: '4px', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                            [기록시간: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}]
                          </div>
                          <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4', fontSize: '13px' }}>{regForm.consultMemo}</p>
                        </div>
                      ) : (
                        '상담처리 기록이 없습니다.'
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* 3. Staff Management View (Matching Screenshot 100% with Team & Manager Supabase Integration) */}
            {currentView === 'staff' && (
              <div className="view-container" style={{ backgroundColor: '#ffffff', padding: '24px' }}>
                
                {/* 1. 팀 관리 Section */}
                <div style={{ marginBottom: '40px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        팀 관리
                        <span style={{ fontSize: '13px', fontWeight: 'normal', color: '#64748b' }}>팀을 조회 및 생성합니다.</span>
                      </h2>
                    </div>
                    <button
                      onClick={handleCreateTeam}
                      style={{ padding: '8px 18px', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
                    >
                      팀 생성
                    </button>
                  </div>

                  <div className="table-wrapper" style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                    <table className="data-table" style={{ width: '100%', minWidth: '800px', textAlign: 'center', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#0f172a', color: 'white' }}>
                          <th style={{ padding: '10px' }}>번호</th>
                          <th style={{ padding: '10px' }}>등록일</th>
                          <th style={{ padding: '10px' }}>이름</th>
                          <th style={{ padding: '10px' }}>팀원 수</th>
                          <th style={{ padding: '10px' }}>팀삭제</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dbTeams.length === 0 ? (
                          <tr>
                            <td colSpan={5} style={{ padding: '24px', color: '#94a3b8' }}>등록된 팀 정보가 없습니다.</td>
                          </tr>
                        ) : (
                          dbTeams.map((team) => {
                            const memberCount = dbManagers.filter(m => m.teamId === team.id).length;
                            return (
                              <tr key={team.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td>{team.id}</td>
                                <td>{formatKoreanDateTime(team.createdAt)}</td>
                                <td style={{ fontWeight: 600 }}>{team.name}</td>
                                <td>{memberCount}</td>
                                <td>
                                  <button
                                    onClick={() => handleDeleteTeam(team.id, team.name)}
                                    style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                                  >
                                    삭제
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. 매니저 관리 Section */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                      매니저 관리
                      <span style={{ fontSize: '13px', fontWeight: 'normal', color: '#64748b' }}>매니저 회원가입 승인 및 매니저 정보를 관리합니다.</span>
                    </h2>
                    <button
                      onClick={() => {
                        setNewManagerData({ name: '', teamId: dbTeams[0]?.id ? String(dbTeams[0].id) : '', phone: '', email: '', address: '', facebookMessenger: '' });
                        setIsAddManagerModalOpen(true);
                      }}
                      style={{ padding: '8px 18px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
                    >
                      매니저 생성
                    </button>
                  </div>

                  <div className="table-wrapper" style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '4px' }}>
                    <table className="data-table" style={{ width: '100%', minWidth: '900px', textAlign: 'center', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#0f172a', color: 'white' }}>
                          <th style={{ padding: '10px', width: '80px' }}>번호</th>
                          <th style={{ padding: '10px' }}>등록일</th>
                          <th style={{ padding: '10px' }}>팀</th>
                          <th style={{ padding: '10px' }}>이름</th>
                          <th style={{ padding: '10px' }}>가입승인</th>
                          <th style={{ padding: '10px' }}>매니저삭제</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dbManagers.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ padding: '24px', color: '#94a3b8' }}>등록된 매니저 정보가 없습니다.</td>
                          </tr>
                        ) : (
                          (() => {
                            const displayedMgrs = dbManagers.slice((managerPage - 1) * managerItemsPerPage, managerPage * managerItemsPerPage);
                            
                            return displayedMgrs.map((mgr, idx) => {
                              const displayIndex = (managerPage - 1) * managerItemsPerPage + idx;
                              return (
                                <tr key={mgr.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                  <td>{displayIndex}</td>
                                  <td>{formatKoreanDateTime(mgr.createdAt)}</td>
                                  <td>
                                    <select
                                      value={mgr.teamId || ''}
                                      onChange={(e) => handleUpdateManagerTeam(mgr.id, Number(e.target.value))}
                                      style={{ padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px', backgroundColor: '#fff' }}
                                    >
                                      {dbTeams.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td style={{ fontWeight: 600 }}>{mgr.name}</td>
                                  <td>
                                    {mgr.isConfirmed ? (
                                      <span style={{ fontSize: '12px', color: '#64748b' }}>승인됨</span>
                                    ) : (
                                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                        <button
                                          onClick={() => handleApproveManager(mgr.id, mgr.name)}
                                          style={{ backgroundColor: '#0ea5e9', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                          승인
                                        </button>
                                        <button
                                          onClick={() => handleDeleteManager(mgr.id, mgr.name)}
                                          style={{ backgroundColor: '#f97316', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                          삭제
                                        </button>
                                      </div>
                                    )}
                                  </td>
                                  <td>
                                    <button
                                      onClick={() => handleDeleteManager(mgr.id, mgr.name)}
                                      style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                      삭제
                                    </button>
                                  </td>
                                </tr>
                              );
                            });
                          })()
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Manager Pagination Navigation Bar (< 이전 1 2 다음 >) */}
                  {dbManagers.length > managerItemsPerPage && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
                      <button
                        disabled={managerPage === 1}
                        onClick={() => setManagerPage(prev => Math.max(prev - 1, 1))}
                        style={{ border: 'none', background: 'none', color: managerPage === 1 ? '#cbd5e1' : '#64748b', cursor: managerPage === 1 ? 'not-allowed' : 'pointer', fontSize: '13px' }}
                      >
                        &lt; 이전
                      </button>

                      {Array.from({ length: Math.ceil(dbManagers.length / managerItemsPerPage) }).map((_, pIdx) => {
                        const pageNum = pIdx + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setManagerPage(pageNum)}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '4px',
                              border: 'none',
                              backgroundColor: managerPage === pageNum ? '#0f172a' : 'transparent',
                              color: managerPage === pageNum ? '#ffffff' : '#475569',
                              fontWeight: managerPage === pageNum ? 'bold' : 'normal',
                              cursor: 'pointer',
                              fontSize: '13px'
                            }}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        disabled={managerPage >= Math.ceil(dbManagers.length / managerItemsPerPage)}
                        onClick={() => setManagerPage(prev => Math.min(prev + 1, Math.ceil(dbManagers.length / managerItemsPerPage)))}
                        style={{ border: 'none', background: 'none', color: managerPage >= Math.ceil(dbManagers.length / managerItemsPerPage) ? '#cbd5e1' : '#64748b', cursor: managerPage >= Math.ceil(dbManagers.length / managerItemsPerPage) ? 'not-allowed' : 'pointer', fontSize: '13px' }}
                      >
                        다음 &gt;
                      </button>
                    </div>
                  )}
                </div>

                {/* Modal for Adding New Manager with Extended Details */}
                {isAddManagerModalOpen && (
                  <div className="modal-backdrop" onClick={() => setIsAddManagerModalOpen(false)}>
                    <div className="modal-content" style={{ maxWidth: '520px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
                      <div className="modal-header" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>신규 매니저 직접 등록</h3>
                        <button className="btn-close" style={{ border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => setIsAddManagerModalOpen(false)}><X size={18} /></button>
                      </div>
                      <form onSubmit={handleSaveNewManager}>
                        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div className="form-group">
                            <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>매니저 성명 <span style={{ color: '#ef4444' }}>*</span></label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="예: Boram, 홍길동"
                              value={newManagerData.name}
                              onChange={(e) => setNewManagerData(prev => ({ ...prev, name: e.target.value }))}
                              required
                              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            />
                          </div>

                          <div className="form-group">
                            <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>소속 팀 <span style={{ color: '#ef4444' }}>*</span></label>
                            <select
                              className="form-control"
                              value={newManagerData.teamId}
                              onChange={(e) => setNewManagerData(prev => ({ ...prev, teamId: e.target.value }))}
                              required
                              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            >
                              <option value="">-- 팀 선택 --</option>
                              {dbTeams.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                              ))}
                            </select>
                          </div>

                          <div className="form-group">
                            <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>연락처 (핸드폰번호)</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="010-XXXX-XXXX"
                              value={newManagerData.phone}
                              onChange={(e) => setNewManagerData(prev => ({ ...prev, phone: e.target.value }))}
                              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            />
                          </div>

                          <div className="form-group">
                            <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>이메일 주소</label>
                            <input
                              type="email"
                              className="form-control"
                              placeholder="manager@novel-tax.kr"
                              value={newManagerData.email}
                              onChange={(e) => setNewManagerData(prev => ({ ...prev, email: e.target.value }))}
                              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            />
                          </div>

                          <div className="form-group">
                            <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>주소 (거주지)</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="주소 입력"
                              value={newManagerData.address}
                              onChange={(e) => setNewManagerData(prev => ({ ...prev, address: e.target.value }))}
                              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            />
                          </div>

                          <div className="form-group">
                            <label style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>페이스북 메신저 / SNS ID</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Facebook ID 또는 메신저 링크"
                              value={newManagerData.facebookMessenger}
                              onChange={(e) => setNewManagerData(prev => ({ ...prev, facebookMessenger: e.target.value }))}
                              style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                            />
                          </div>
                        </div>

                        <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button type="button" className="btn-cancel" style={{ padding: '8px 16px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#fff', cursor: 'pointer' }} onClick={() => setIsAddManagerModalOpen(false)}>취소</button>
                          <button type="submit" className="btn-submit" style={{ padding: '8px 18px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>등록 완료</button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* 4. Password Change View */}
            {currentView === 'password' && (
              <div className="view-container">
                <div className="view-card form-narrow">
                  <h2 className="view-title">보안 비밀번호 변경</h2>
                  <form onSubmit={handleChangePassword}>
                    <div className="form-group">
                      <label>현재 비밀번호</label>
                      <input
                        type="password"
                        className="form-control"
                        value={passwordChangeText.current}
                        onChange={(e) => setPasswordChangeText(prev => ({ ...prev, current: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>새 비밀번호</label>
                      <input
                        type="password"
                        className="form-control"
                        value={passwordChangeText.new}
                        onChange={(e) => setPasswordChangeText(prev => ({ ...prev, new: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '24px' }}>
                      <label>새 비밀번호 확인</label>
                      <input
                        type="password"
                        className="form-control"
                        value={passwordChangeText.confirm}
                        onChange={(e) => setPasswordChangeText(prev => ({ ...prev, confirm: e.target.value }))}
                        required
                      />
                    </div>
                    <button type="submit" className="btn-action btn-add" style={{ display: 'inline-flex', width: 'auto' }}>
                      <Save size={16} />
                      비밀번호 업데이트
                    </button>
                  </form>
                </div>
              </div>
            )}

          </main>
        </div>
      )}
    </>
  );
}

export default App;
