// Supabase Configuration
// Prefer runtime config from `config.js` or environment. Update `config.js` with your credentials.
const _cfg = (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.SUPABASE_URL) ? window.SUPABASE_CONFIG : { SUPABASE_URL: 'https://YOUR_PROJECT_ID.supabase.co', SUPABASE_ANON_KEY: 'YOUR_ANON_KEY' };
const SUPABASE_URL = _cfg.SUPABASE_URL;
const SUPABASE_ANON_KEY = _cfg.SUPABASE_ANON_KEY;

let supabase = null;

// Initialize Supabase
function initSupabase() {
  if (!SUPABASE_URL.includes('YOUR_PROJECT_ID')) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase initialized');
  } else {
    console.warn('⚠️ Supabase credentials not configured. Please update SUPABASE_URL and SUPABASE_ANON_KEY in app.js');
  }
}

// Form Elements
const form = document.getElementById('vendorForm');
const submitBtn = document.getElementById('submitBtn');
const submitText = document.getElementById('submitText');
const submitSpinner = document.getElementById('submitSpinner');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

// Form Submission Handler
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Check if Supabase is configured
  if (!supabase) {
    showError('Supabase is not configured. Please follow the setup instructions in README.md');
    return;
  }

  // Disable submit button and show loading state
  submitBtn.disabled = true;
  submitText.style.display = 'none';
  submitSpinner.style.display = 'inline-block';

  // Collect form data
  const formData = new FormData(form);
  const data = {
    business_name: formData.get('businessName'),
    industry: formData.get('industry'),
    business_address: formData.get('businessAddress'),
    business_website: formData.get('businessWebsite') || null,
    business_email: formData.get('businessEmail') || null,
    contact_person: formData.get('contactPerson'),
    contact_person_title: formData.get('contactTitle'),
    business_phone: formData.get('businessPhone'),
    contact_phone: formData.get('contactPhone'),
    state_licensed: formData.get('stateLicensed') || null,
    parker_business_license: formData.get('parkerLicense'),
    crit_business_license: formData.get('critLicense'),
    schedule_methods: getCheckedValues('scheduleMethod'),
    submitted_at: new Date().toISOString(),
    ip_address: await getClientIp()
  };

  try {
    // Insert data into Supabase
    const { data: result, error } = await supabase
      .from('vendor_registrations')
      .insert([data]);

    if (error) {
      throw error;
    }

    // Show success message
    form.style.display = 'none';
    successMessage.style.display = 'block';
    
    // Log to console for debugging
    console.log('✓ Registration submitted successfully:', data);

  } catch (error) {
    console.error('Error submitting form:', error);
    showError(error.message || 'Failed to submit registration. Please try again.');
  } finally {
    // Reset button state
    submitBtn.disabled = false;
    submitText.style.display = 'inline';
    submitSpinner.style.display = 'none';
  }
});

// Helper function to get checked checkbox values
function getCheckedValues(name) {
  const checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
  return Array.from(checkboxes).map(cb => cb.value);
}

// Helper function to show error message
function showError(message) {
  errorText.textContent = message;
  form.style.display = 'none';
  errorMessage.style.display = 'flex';
}

// Close error and show form again
function closeError() {
  errorMessage.style.display = 'none';
  form.style.display = 'block';
  submitBtn.disabled = false;
  submitText.style.display = 'inline';
  submitSpinner.style.display = 'none';
}

// Get client IP for logging
async function getClientIp() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.warn('Could not fetch IP address:', error);
    return null;
  }
}

// Validate at least one schedule method is selected
form.addEventListener('submit', (e) => {
  const checkedMethods = getCheckedValues('scheduleMethod');
  if (checkedMethods.length === 0) {
    e.preventDefault();
    showError('Please select at least one preferred contact method.');
  }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initSupabase();
  
  // Show warning if not configured
  if (!supabase) {
    const warning = document.createElement('div');
    warning.style.cssText = `
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 1rem;
      margin-bottom: 1rem;
      border-radius: 4px;
      color: #92400e;
    `;
    warning.innerHTML = `
      <strong>⚠️ Setup Required:</strong> This form needs Supabase configuration. 
      Please follow the setup instructions in <code>README.md</code> before deploying.
    `;
    document.querySelector('.form-wrapper').insertBefore(warning, form);
  }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getCheckedValues, showError, closeError };
}
