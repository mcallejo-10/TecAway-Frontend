import { ComponentFixture, TestBed } from '@angular/core/testing';


import { AddKnowledgesComponent } from './add-knowledges.component';

describe('AddKnowledgesComponent', () => {
  let component: AddKnowledgesComponent;
  let fixture: ComponentFixture<AddKnowledgesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddKnowledgesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddKnowledgesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
