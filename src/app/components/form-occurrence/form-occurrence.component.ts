import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';
import { OccurrenceService } from '../../services/occurrence.service';
import { AclService } from 'ng2-acl';
import { NotifyService } from './../../services/notify/notify.service';

@Component({
  selector: 'app-form-occurrence',
  templateUrl: './form-occurrence.component.html',
  styleUrls: ['./form-occurrence.component.scss']
})
export class FormOccurrenceComponent implements OnInit {

  involved_person: FormGroup;
  formOccurrence: FormGroup;
  loading = false;
  submitted = false;

  // Validator patterns
  titlePattern = '^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ0-9,.!?*"#%(); -]{6,32}$';
  storyPattern = '^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ0-9,.!?*"#%(); -]{12,256}$';
  cpfPattern = '^[0-9]{11}$';
  namePattern = '^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ ]{4,52}$';

  lat  = -8.05225025;
  lng  = -34.9450490084884;
  locationChosen = false;

  onChoseLocation(event) {
    this.lat = event.coords.lat;
    this.lng = event.coords.lng;
    this.locationChosen = true;
  }

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private occurrenceService: OccurrenceService,
    public aclService: AclService,
    private notifier: NotifyService

  ) { }

  ngOnInit() {

    this.formOccurrence = this.formBuilder.group({
      title: ['', [ Validators.required, Validators.pattern(this.titlePattern)]],
      story: ['', [Validators.required, Validators.pattern(this.storyPattern)]],
      occurrence_date: ['', [Validators.required]],
      occurrence_time: ['', Validators.required],
      coordinates: [this.lat, this.lng],
      police_report: ['', Validators.required],
      estimated_loss: ['345'],
      occurrence_type_id: ['', Validators.required],
      zone_id: ['', Validators.required],

      involved_person: this.formBuilder.group({
        name: ['', Validators.pattern(this.namePattern)],
        cpf: ['', [Validators.pattern(this.cpfPattern)]],
        gender: [''],
        skin_color: [''],
        type: ['']
      }),

      occurrence_objects: this.formBuilder.group({
        object_id: [Number]
      })
    });
    (<HTMLInputElement>document.getElementById('datefield')).max = new Date(new Date().getTime()
    - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
  }

  get f() { return this.formOccurrence.controls; }

  onSubmit() {
    this.submitted = true;

        // stop here if form is invalid
        if (this.formOccurrence.invalid) {
          this.notifier.show('warning', 'Erro ao tentar registrar, confira se os campos foram preenchidos corretamente.');
          return;
        }

        this.loading = true;
        this.occurrenceService.registerOccurrence(this.formOccurrence.value)
            .pipe(first())
            .subscribe(
                data => {
                  alert('Registro de ocorrência realizado com sucesso!');
                  this.router.navigate(['home']);
                },
                error => {
                  this.loading = false;
                  alert('Ocorreu um erro ao tentar registrar sua ocorrência.');
                });
  }

  confirmInvolved() {
      alert('Envolvido Adicionado');
  }


}
