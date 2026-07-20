import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://jjdykydkgtosiymxjpmh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqZHlreWRrZ3Rvc2l5bXhqcG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTkyNjIzODQsImV4cCI6MjAxNDgzODM4NH0.gV2jrgbe8ptcdJ0WoD10l1ycFUgHj9nKrx_tNCJzbjU";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface SupabaseClientRecord {
  id?: string;
  name: string;
  regNum: string;
  country: string;
  visa: string;
  phone?: string;
  phoneCompany?: string;
  company?: string;
  isMonthlyRent?: boolean;
  bank?: string;
  bankAccount?: string;
  address?: string;
  hometaxId?: string;
  hometaxPw?: string;
  managerId?: string;
  isAdditionalApply?: boolean;
  updatedAt?: string;
}

export interface SupabaseYearEndRecord {
  id?: string;
  clientId: string;
  year: number;
  companyName?: string;
  companyRegNum?: string;
  regNum?: string;
  netSalary?: number;
  determineTax?: number;
  smallBusinessYouthTaxCredit?: number;
  calculatedEarnedIncomeTaxCredit?: number;
  changedDetermineTax?: number;
  changedLocalTax?: number;
  totalTaxRefund?: number;
  localTaxRefund?: number;
  fileURL?: string;
  correctionClaimFileURL?: string;
  isSmallBusiness?: boolean;
  updatedAt?: string;
}

/**
 * Fetch all clients and their year-end tax records from Supabase
 */
export async function fetchClientsFromSupabase() {
  try {
    const { data: clients, error: clientErr } = await supabase
      .from('Client')
      .select('*')
      .order('createdAt', { ascending: false });

    if (clientErr) {
      console.warn('Supabase Client fetch error/notice:', clientErr.message);
      return null;
    }

    if (!clients || clients.length === 0) {
      return [];
    }

    const { data: yearEnds, error: yearErr } = await supabase
      .from('YearEndData')
      .select('*');

    if (yearErr) {
      console.warn('Supabase YearEndData fetch error:', yearErr.message);
    }

    return { clients, yearEnds: yearEnds || [] };
  } catch (err) {
    console.error('Supabase fetch exception:', err);
    return null;
  }
}

/**
 * Upload a PDF file to Supabase Storage and return its public URL
 */
export async function uploadPdfToSupabase(file: File, path: string): Promise<string | null> {
  try {
    const bucketName = 'documents';
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(path, file, { upsert: true });

    if (error) {
      console.warn(`Storage upload warning for ${path}:`, error.message);
      const { error: fbErr } = await supabase.storage
        .from('files')
        .upload(path, file, { upsert: true });
      if (fbErr) {
        console.warn('Fallback bucket upload warning:', fbErr.message);
        return null;
      }
      const { data: publicUrlData } = supabase.storage.from('files').getPublicUrl(path);
      return publicUrlData.publicUrl;
    }

    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(path);
    return publicUrlData.publicUrl;
  } catch (err) {
    console.error('Error uploading PDF to Supabase:', err);
    return null;
  }
}

/**
 * Save complete registration form & year-end records to Supabase with full column coverage
 */
export async function saveRegistrationToSupabase(regForm: any, pdfFileObjects: Record<string, File | null>) {
  try {
    // 1. Check if client already exists by regNum
    let clientId: string | null = null;
    if (regForm.foreignerNumber) {
      const { data: existing } = await supabase
        .from('Client')
        .select('id')
        .eq('regNum', regForm.foreignerNumber)
        .maybeSingle();

      if (existing) {
        clientId = existing.id;
      }
    }

    // 2. Insert or Update Client (Full mapping against DB schema)
    const clientPayload: Record<string, any> = {
      name: regForm.name ? regForm.name.toUpperCase() : '',
      regNum: regForm.foreignerNumber || '',
      country: regForm.nationality || '인도네시아',
      visa: regForm.visaType || 'E9',
      company: regForm.years['2025']?.workPlace || regForm.years['2024']?.workPlace || '',
      isMonthlyRent: regForm.isMonthlyRent === '가',
      phone: regForm.phone || '',
      phoneCompany: regForm.telecom || 'SKT',
      bank: regForm.refundBankName || '',
      bankAccount: regForm.refundBank || '',
      address: regForm.residentAddress || regForm.residentRegisterAddress || '',
      hometaxId: regForm.hometaxId || '',
      hometaxPw: regForm.hometaxPw || '',
      isAdditionalApply: Boolean(regForm.additionalApplyPerformance && regForm.additionalApplyPerformance !== '0'),
      updatedAt: new Date().toISOString()
    };

    if (clientId) {
      await supabase.from('Client').update(clientPayload).eq('id', clientId);
    } else {
      const { data: newClient, error: insertErr } = await supabase
        .from('Client')
        .insert([{ ...clientPayload, createdAt: new Date().toISOString() }])
        .select()
        .single();

      if (insertErr) {
        console.warn('Insert Client error:', insertErr.message);
      } else if (newClient) {
        clientId = newClient.id;
      }
    }

    if (!clientId) {
      console.warn('Client ID could not be established; skipping YearEndData saved');
      return { success: false, clientId: null };
    }

    // 3. Process YearEndData for each year (2022 ~ 2025)
    const years = ['2022', '2023', '2024', '2025'];
    for (const yr of years) {
      const yrData = regForm.years[yr];
      if (!yrData) continue;

      let fileURL: string | undefined = undefined;
      const pdfFile = pdfFileObjects[yr];
      if (pdfFile) {
        const uploadPath = `pdf/${clientId}/${yr}_${pdfFile.name}`;
        const uploadedUrl = await uploadPdfToSupabase(pdfFile, uploadPath);
        if (uploadedUrl) {
          fileURL = uploadedUrl;
        }
      }

      const yearPayload: Record<string, any> = {
        clientId: clientId,
        year: parseInt(yr, 10),
        companyName: yrData.workPlace || '',
        netSalary: Number(yrData.totalSalary) || 0,
        determineTax: Number(yrData.originalDeterminedTax) || 0,
        smallBusinessYouthTaxCredit: Number(yrData.appliedTaxReduction) || 0,
        totalTaxRefund: Number(yrData.expectedRefundNational) || 0,
        localTaxRefund: Number(yrData.expectedRefundLocal) || 0,
        changedDetermineTax: Number(yrData.recalcDeterminedTax) || 0,
        changedLocalTax: Number(yrData.recalcLocalTax) || 0,
        regNum: regForm.foreignerNumber || '',
        isSmallBusiness: yrData.isReductionEligible === '여' || yrData.appliedTaxReduction > 0,
        updatedAt: new Date().toISOString(),
        ...(fileURL ? { fileURL } : {})
      };

      const { data: existingYr } = await supabase
        .from('YearEndData')
        .select('id')
        .eq('clientId', clientId)
        .eq('year', parseInt(yr, 10))
        .maybeSingle();

      if (existingYr) {
        await supabase.from('YearEndData').update(yearPayload).eq('id', existingYr.id);
      } else {
        await supabase.from('YearEndData').insert([{ ...yearPayload, createdAt: new Date().toISOString() }]);
      }
    }

    return { success: true, clientId };
  } catch (err) {
    console.error('saveRegistrationToSupabase Exception:', err);
    return { success: false, error: err };
  }
}
