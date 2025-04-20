// student-manager.js
class StudentManager {
  constructor() {
      this.initializeEventListeners();
      this.loadUserData();
      this.setupFilterOptions();
  }

  initializeEventListeners() {
      // Form submission
      $('#saveNewStudent').on('click', () => this.handleStudentSubmission());
      
      // Search functionality
      $('#searchInput').on('input', (e) => this.handleSearch(e.target.value));
      
      // Filter events
      $('#1BAC, #2BAC').on('change', (e) => this.handleLevelFilter(e));
      $('#sMath, #sEx').on('change', (e) => this.handleBranchFilter(e));
      
      // Photo preview
      $('#studentPhoto').on('change', (e) => this.handlePhotoPreview(e));

      // Table action buttons
      $(document).on('click', '.view-btn', (e) => this.handleViewStudent(e));
      $(document).on('click', '.edit-btn', (e) => this.handleEditStudent(e));
      $(document).on('click', '.delete-btn', (e) => this.handleDeleteStudent(e));

      // Modal events
      $('#studentModal').on('hidden.bs.modal', () => this.resetForm());
      $('#saveEditButton').on('click', () => this.saveEditedStudent());
  }

  setupFilterOptions() {
      // Setup class options based on level and branch
      $('#1BAC').on('change', () => {
          this.updateClassOptions('1');
      });

      $('#2BAC').on('change', () => {
          this.updateClassOptions('2');
      });
  }

  updateClassOptions(year) {
      const classOptions = year === '1' 
          ? ['1/1', '1/2', '1/3', '1/4', '1/5']
          : ['2/1', '2/2', '2/3', '2/4'];

      const container = $('#classePremiereAnnee');
      container.empty();

      classOptions.forEach(classe => {
          container.append(`
              <label class="btn buttons">
                  <input type="radio" name="optionsClasse" value="${classe}" class="buttons">
                  ${classe}
              </label>
          `);
      });
  }


  collectFormData() {
      const formData = new FormData();
      
      // Personal Information
      formData.append('photo', $('#studentPhoto')[0].files[0]);
      formData.append('name', $('#studentName').val().trim());
      formData.append('massarCode', $('#massarCode').val().trim());
      formData.append('birthDate', $('#studentBirthDate').val());
      formData.append('birthPlace', $('#studentBirthPlace').val().trim());
      
      // Parents Information
      formData.append('fatherName', $('#fatherName').val().trim());
      formData.append('fatherProfession', $('#fatherProfession').val().trim());
      formData.append('motherName', $('#motherName').val().trim());
      formData.append('motherProfession', $('#motherProfession').val().trim());
      formData.append('fatherPhone', $('#fatherPhone').val().trim());
      formData.append('motherPhone', $('#motherPhone').val().trim());
      
      // Identity Documents
      formData.append('idCardNumber', $('#identityCardNumber').val().trim());
      formData.append('idCardExpiry', $('#identityCardExpiry').val());
      formData.append('lyceeCardNumber', $('#lyceeCardNumber').val().trim());
      formData.append('lyceeCardExpiry', $('#lyceeCardExpiry').val());
      formData.append('passportNumber', $('#passportNumber').val().trim());
      formData.append('passportDate', $('#passportDate').val());
      formData.append('driverLicenseNumber', $('#driverLicenseNumber').val().trim());
      formData.append('driverLicenseDate', $('#driverLicenseDate').val());
      
      // School Information
      formData.append('schoolOrigin', $('#schoolOrigin').val().trim());
      formData.append('schoolAddress', $('#schoolAddress').val().trim());
      formData.append('emergencyContact', $('#emergencyContact').val().trim());
      formData.append('personalPhone', $('#personalPhone').val().trim());
      
      // Family Information
      formData.append('brothersNumber', $('#brothersNumber').val());
      formData.append('sistersNumber', $('#sistersNumber').val());
      formData.append('prchesNumber', $('#prchesNumber').val());
      
      // Academic Information
      formData.append('entryDate', $('#entryDate').val());
      formData.append('examDate', $('#examDate').val());
      formData.append('examMethod', $('#examMethod').val());
      formData.append('option', $('#option').val());
      formData.append('classe', $('#classe').val());

      return formData;
  }

  validateStudentData(formData) {
      const requiredFields = ['name', 'massarCode', 'birthDate'];
      
      for (const field of requiredFields) {
          if (!formData.get(field)) {
              this.showError(`Le champ ${field} est obligatoire`);
              return false;
          }
      }

      // Validate Massar Code format (example: letter followed by 9 digits)
      const massarCode = formData.get('massarCode');
      if (!/^[A-Z][0-9]{9}$/.test(massarCode)) {
          this.showError('Format du Code Massar invalide');
          return false;
      }

      // Validate phone numbers
      const phoneFields = ['fatherPhone', 'motherPhone', 'personalPhone', 'emergencyContact'];
      for (const field of phoneFields) {
          const phone = formData.get(field);
          if (phone && !/^[0-9]{10}$/.test(phone)) {
              this.showError(`Format du numéro de téléphone invalide: ${field}`);
              return false;
          }
      }

      return true;
  }

  async handleStudentSubmission() {
      const formData = this.collectFormData();
      
      if (!this.validateStudentData(formData)) {
          return;
      }

      try {
          const response = await $.ajax({
              type: 'POST',
              url: 'php/save_student.php',
              data: formData,
              processData: false,
              contentType: false,
              dataType: 'json'
          });

          if (response.success) {
              this.addStudentToTable(formData);
              this.resetForm();
              $('#studentModal').modal('hide');
              this.showSuccess('Étudiant ajouté avec succès');
          } else {
              this.showError(response.error || 'Échec de l\'enregistrement');
          }
      } catch (error) {
          console.error('Error saving student:', error);
          this.showError('Une erreur est survenue lors de l\'enregistrement');
      }
  }

  handleSearch(searchTerm) {
      const normalizedTerm = searchTerm.toLowerCase();
      
      $('#StudentsTable tbody tr').each(function() {
          const studentName = $(this).find('td:eq(0)').text().toLowerCase();
          const massarCode = $(this).find('td:eq(1)').text().toLowerCase();
          const idCard = $(this).find('td:eq(2)').text().toLowerCase();
          
          const matches = studentName.includes(normalizedTerm) || 
                        massarCode.includes(normalizedTerm) ||
                        idCard.includes(normalizedTerm);
          
          $(this).toggle(matches);
      });
  }

  handlePhotoPreview(event) {
      const file = event.target.files[0];
      if (file) {
          if (!file.type.startsWith('image/')) {
              this.showError('Please select an image file');
              event.target.value = '';
              return;
          }

          const reader = new FileReader();
          reader.onload = (e) => {
              $('#studentPreview').attr('src', e.target.result).show();
          };
          reader.readAsDataURL(file);
      }
  }

  async handleViewStudent(event) {
      const row = $(event.target).closest('tr');
      const studentId = row.data('student-id');

      try {
          const response = await $.ajax({
              url: 'php/get_student.php',
              type: 'GET',
              data: { id: studentId },
              dataType: 'json'
          });

          if (response.success) {
              this.populateViewModal(response.student);
              $('#viewModal').modal('show');
          } else {
              this.showError('Failed to load student data');
          }
      } catch (error) {
          console.error('Error loading student:', error);
          this.showError('Error loading student data');
      }
  }

  async handleEditStudent(event) {
      const row = $(event.target).closest('tr');
      const studentId = row.data('student-id');

      try {
          const response = await $.ajax({
              url: 'php/get_student.php',
              type: 'GET',
              data: { id: studentId },
              dataType: 'json'
          });

          if (response.success) {
              this.populateEditModal(response.student);
              $('#editModal').modal('show');
          } else {
              this.showError('Failed to load student data');
          }
      } catch (error) {
          console.error('Error loading student:', error);
          this.showError('Error loading student data');
      }
  }

  async handleDeleteStudent(event) {
      if (!confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
          return;
      }

      const row = $(event.target).closest('tr');
      const studentId = row.data('student-id');

      try {
          const response = await $.ajax({
              url: 'php/delete_student.php',
              type: 'POST',
              data: { id: studentId },
              dataType: 'json'
          });

          if (response.success) {
              row.remove();
              this.showSuccess('Étudiant supprimé avec succès');
          } else {
              this.showError('Failed to delete student');
          }
      } catch (error) {
          console.error('Error deleting student:', error);
          this.showError('Error deleting student');
      }
  }

  populateViewModal(student) {
      $('#viewStudentName').val(student.name);
      $('#viewStudentMassarCode').val(student.massarCode);
      $('#viewStudentIdCardNumber').val(student.idCardNumber);
      $('#viewStudentLevel').val(student.level);
      $('#viewStudentClasse').val(student.classe);
  }

  populateEditModal(student) {
      $('#editStudentName').val(student.name);
      $('#editStudentMassarCode').val(student.massarCode);
      $('#editStudentIdCardNumber').val(student.idCardNumber);
      $('#editStudentLevel').val(student.level);
      $('#editStudentClasse').val(student.classe);
  }

  async saveEditedStudent() {
      const studentId = $('#editModal').data('student-id');
      const formData = new FormData($('#editStudentForm')[0]);
      formData.append('id', studentId);

      try {
          const response = await $.ajax({
              url: 'php/update_student.php',
              type: 'POST',
              data: formData,
              processData: false,
              contentType: false,
              dataType: 'json'
          });

          if (response.success) {
              this.updateStudentInTable(studentId, formData);
              $('#editModal').modal('hide');
              this.showSuccess('Étudiant mis à jour avec succès');
          } else {
              this.showError('Failed to update student');
          }
      } catch (error) {
          console.error('Error updating student:', error);
          this.showError('Error updating student');
      }
  }

  updateStudentInTable(studentId, formData) {
      const row = $(`tr[data-student-id="${studentId}"]`);
      row.find('td:eq(0)').text(formData.get('name'));
      row.find('td:eq(1)').text(formData.get('massarCode'));
      row.find('td:eq(2)').text(formData.get('idCardNumber'));
      row.find('td:eq(3)').text(formData.get('level'));
      row.find('td:eq(4)').text(formData.get('classe'));
  }

  resetForm() {
      $('form')[0].reset();
      $('#studentPreview').attr('src', '').hide();
  }

  showSuccess(message) {
      Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: message,
          timer: 2000,
          showConfirmButton: false
      });
  }

  showError(message) {
      Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: message
      });
  }
}

// Initialize the application when the document is ready