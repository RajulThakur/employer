// Default admin account
const adminAccount = {
    'CPCG020': {
        password: 'password123', // In real app, this would be hashed
        name: 'Dhruv Baruah',
        email: 'dbaruah985@gmail.com',
        phone: '880XXXXXX',
        gender: 'MALE',
        joiningDate: '01-06-1997',
        birthDate: '01-10-1971',
        degree: 'Class 10 Pass',
        avatar: 'img/avatar.png',
        leaveBalance: {
            casual: 12,
            earned: 15,
            sick: 7,
            compensatory: 3
        },
        recentActivity: [
            {
                type: 'check-in',
                title: "Today's Check-in",
                time: '09:00 AM',
                icon: 'sign-in-alt'
            },
            {
                type: 'leave',
                title: 'Leave Application',
                description: 'Approved - 2 days casual leave',
                icon: 'file-alt'
            },
            {
                type: 'hours',
                title: "Yesterday's Hours",
                description: '8 hours 30 minutes',
                icon: 'clock'
            }
        ],
        attendance: {
            percentage: 90,
            status: 'Present'
        }
    }
};

const API_BASE_URL = 'http://localhost:8084/api';

// Check if server is running
async function checkServer() {
    try {
        const response = await fetch(`${API_BASE_URL}/employees`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        console.log('Server status:', response.status);
        return response.ok;
    } catch (error) {
        console.error('Server check failed:', error);
        return false;
    }
}

// Example API call
async function getEmployeeProfile(email) {
    const response = await fetch(`${API_BASE_URL}/employees/email/${email}`);
    return response.json();
}

// Handle form submission
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const employeeId = document.getElementById('employeeId').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const loading = document.getElementById('loading');
    
    // Hide error message and show loading
    errorMessage.style.display = 'none';
    loading.style.display = 'block';
    
    try {
        // Check if server is running
        const serverRunning = await checkServer();
        if (!serverRunning) {
            throw new Error('Unable to connect to server. Please ensure the server is running.');
        }

        // Call the backend API
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ employeeId, password })
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Login endpoint not found. Please check server configuration.');
            }
            const errorData = await response.json();
            throw new Error(errorData.message || 'Server error occurred');
        }

        const data = await response.json();
        console.log('Login response:', data); // Debug log
        
        if (data.success) {
            // Store authentication state
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('employeeId', employeeId);
            
            // Store complete profile data
            const profileData = {
                name: data.employee.name,
                id: data.employee.employeeId,
                email: data.employee.email,
                phone: data.employee.phone,
                gender: data.employee.gender,
                joiningDate: data.employee.joiningDate,
                birthDate: data.employee.birthDate,
                degree: data.employee.degree,
                department: data.employee.department,
                designation: data.employee.designation,
                employmentType: data.employee.employmentType,
                avatar: data.employee.avatarUrl || 'img/avatar.png'
            };
            
            // Store additional dashboard data
            const leaveBalance = {
                casual: data.employee.casualLeave || 12,
                earned: data.employee.earnedLeave || 15,
                sick: data.employee.sickLeave || 7,
                compensatory: data.employee.compensatoryLeave || 3
            };
            
            localStorage.setItem('leaveBalance', JSON.stringify(leaveBalance));
            localStorage.setItem('attendance', JSON.stringify({
                percentage: data.employee.attendancePercentage || 100,
                status: data.employee.currentStatus || 'Present'
            }));
            
            // Store profile data
            localStorage.setItem('userProfile', JSON.stringify(profileData));
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            throw new Error(data.message || 'Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Login error:', error); // Debug log
        errorMessage.textContent = error.message || 'An error occurred during login. Please try again.';
        errorMessage.style.display = 'block';
    } finally {
        loading.style.display = 'none';
    }
});

async function login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    return response.json();
}

// Register admin account in backend
async function registerAdminAccount() {
    try {
        // Check if server is running first
        const serverRunning = await checkServer();
        if (!serverRunning) {
            console.error('Server is not running. Cannot register admin account.');
            return;
        }

        const admin = {
            employeeId: 'CPCG020',
            password: 'password123',
            name: 'Dhruv Baruah',
            email: 'dbaruah985@gmail.com',
            phone: '880XXXXXX',
            gender: 'MALE',
            joiningDate: '1997-06-01',
            birthDate: '1971-10-01',
            degree: 'Class 10 Pass',
            department: 'Administration',
            designation: 'Admin',
            employmentType: 'Full-time',
            avatarUrl: 'img/avatar.png'
        };

        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(admin)
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Registration endpoint not found');
            }
            const errorData = await response.json();
            throw new Error(errorData.message || 'Registration failed');
        }

        const data = await response.json();
        console.log('Admin registration response:', data);
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to register admin account');
        }
        
        return data;
    } catch (error) {
        console.error('Failed to register admin:', error.message);
        // Don't throw the error, just log it
        return null;
    }
}

// Call this when the page loads
window.addEventListener('load', async () => {
    try {
        await registerAdminAccount();
    } catch (error) {
        console.error('Error during admin registration:', error);
    }
}); 