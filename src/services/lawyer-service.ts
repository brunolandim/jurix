import { Lawyer } from '@/types';

const mockLawyers: Lawyer[] = [
  {
    id: 'law-001',
    name: 'Dr. Bruno Landim',
    email: 'carlos.silva@jurix.com',
    phone: '(11) 99999-1111',
    photo: '/img/homemSpider.jpg',
    oab: 'SP 123.456',
    specialty: 'Direito Civil',
    active: true,
    createdAt: '2024-01-01',
  },
  {
    id: 'law-002',
    name: 'Dra. Ana Oliveira',
    email: 'ana.oliveira@jurix.com',
    phone: '(11) 99999-2222',
    photo: 'https://i.pravatar.cc/150?u=ana',
    oab: 'SP 234.567',
    specialty: 'Direito Trabalhista',
    active: true,
    createdAt: '2024-01-05',
  },
  {
    id: 'law-003',
    name: 'Dr. Pedro Santos',
    email: 'pedro.santos@jurix.com',
    phone: '(11) 99999-3333',
    photo: 'https://i.pravatar.cc/150?u=pedro',
    oab: 'SP 345.678',
    specialty: 'Direito Penal',
    active: true,
    createdAt: '2024-02-01',
  },
  {
    id: 'law-005',
    name: 'Dr. João Pereira',
    email: 'joao.pereira@jurix.com',
    photo: 'https://i.pravatar.cc/150?u=joao',
    oab: 'SP 567.890',
    specialty: 'Direito Tributário',
    active: true,
    createdAt: '2024-03-01',
  },
  {
    id: 'law-006',
    name: 'Dra. Fernanda Lima',
    email: 'fernanda.lima@jurix.com',
    phone: '(11) 99999-5555',
    photo: 'https://i.pravatar.cc/150?u=camila',
    oab: 'SP 678.901',
    specialty: 'Direito de Família',
    active: true,
    createdAt: '2024-03-10',
  },
  {
    id: 'law-007',
    name: 'Dr. Ricardo Mendes',
    email: 'ricardo.mendes@jurix.com',
    phone: '(11) 99999-6666',
    photo: 'https://i.pravatar.cc/150?u=ricardo',
    oab: 'SP 789.012',
    specialty: 'Direito Imobiliário',
    active: true,
    createdAt: '2024-04-01',
  },
  {
    id: 'law-008',
    name: 'Dra. Beatriz Rocha',
    email: 'beatriz.rocha@jurix.com',
    phone: '(11) 99999-7777',
    photo: 'https://i.pravatar.cc/150?u=beatriz',
    oab: 'SP 890.123',
    specialty: 'Direito do Consumidor',
    active: true,
    createdAt: '2024-04-15',
  },
  {
    id: 'law-009',
    name: 'Dr. Lucas Almeida',
    email: 'lucas.almeida@jurix.com',
    phone: '(11) 99999-8888',
    oab: 'SP 901.234',
    specialty: 'Direito Ambiental',
    active: true,
    createdAt: '2024-05-01',
  },
  {
    id: 'law-010',
    name: 'Dra. Camila Souza',
    email: 'camila.souza@jurix.com',
    phone: '(11) 99999-9999',
    photo: 'https://i.pravatar.cc/150?u=camila',
    oab: 'SP 012.345',
    specialty: 'Direito Digital',
    active: true,
    createdAt: '2024-05-15',
  },
  {
    id: 'law-011',
    name: 'Dr. Gabriel Ferreira',
    email: 'gabriel.ferreira@jurix.com',
    oab: 'RJ 111.222',
    specialty: 'Direito Internacional',
    active: false,
    createdAt: '2024-06-01',
  },
  {
    id: 'law-012',
    name: 'Dra. Juliana Martins',
    email: 'juliana.martins@jurix.com',
    phone: '(11) 98888-1111',
    photo: 'https://i.pravatar.cc/150?u=juliana',
    oab: 'SP 222.333',
    specialty: 'Direito Previdenciário',
    active: true,
    createdAt: '2024-06-15',
  },
];

const USE_MOCK = true;

export const lawyerService = {
  async getLawyers(): Promise<Lawyer[]> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockLawyers.filter((l) => l.active);
    }

    // TODO: Implement real API call
    return [];
  },

  async getAllLawyers(): Promise<Lawyer[]> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockLawyers;
    }

    return [];
  },

  async getLawyerById(id: string): Promise<Lawyer | null> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return mockLawyers.find((l) => l.id === id) || null;
    }

    return null;
  },

  async createLawyer(lawyer: Omit<Lawyer, 'id' | 'createdAt'>): Promise<Lawyer> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const newLawyer: Lawyer = {
        ...lawyer,
        id: `law-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      mockLawyers.push(newLawyer);
      return newLawyer;
    }

    throw new Error('Not implemented');
  },

  async updateLawyer(id: string, data: Partial<Lawyer>): Promise<Lawyer | null> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const index = mockLawyers.findIndex((l) => l.id === id);
      if (index === -1) return null;

      mockLawyers[index] = { ...mockLawyers[index], ...data };
      return mockLawyers[index];
    }

    return null;
  },

  async deleteLawyer(id: string): Promise<boolean> {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const index = mockLawyers.findIndex((l) => l.id === id);
      if (index === -1) return false;

      mockLawyers.splice(index, 1);
      return true;
    }

    return false;
  },
};
