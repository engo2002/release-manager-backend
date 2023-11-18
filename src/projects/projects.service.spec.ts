import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Project } from './entity/project.entity';
import { ProjectService } from './projects.service';

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Project 1',
    description: 'Description for Project 1',
    link: 'https://project1.com',
  },
  {
    id: '2',
    name: 'Project 2',
    description: 'Description for Project 2',
    link: 'https://project2.com',
  },
  // Add more mock projects as needed...
];

const mockProjectRepository = {
  find: jest.fn().mockResolvedValue(mockProjects),
  findOne: jest.fn().mockImplementation((id: string) =>
      Promise.resolve(mockProjects.find(project => project.id === id)),
  ),
  create: jest.fn().mockImplementation((projectData: Partial<Project>) =>
      Promise.resolve({ id: '3', ...projectData } as Project),
  ),
  save: jest.fn().mockImplementation((project: Partial<Project>) =>
      Promise.resolve({ id: '3', ...project } as Project),
  ),
  update: jest.fn().mockImplementation((id: string, projectData: Partial<Project>) =>
      Promise.resolve({ id, ...projectData } as Project),
  ),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
};

describe('ProjectService', () => {
  let projectService: ProjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectRepository,
        },
      ],
    }).compile();

    projectService = module.get<ProjectService>(ProjectService);
  });

  it('should be defined', () => {
    expect(projectService).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of projects', async () => {
      const mockProjects: Project[] = [/* Mock Project data */];
      mockProjectRepository.find.mockReturnValue(mockProjects);

      const projects = await projectService.findAll();

      expect(projects).toEqual(mockProjects);
    });
  });

  describe('findOne', () => {
    it('should return a project by ID', async () => {
      const projectId = mockProjects[0].id;
      const mockProject: Project = mockProjects[0];
      mockProjectRepository.findOne.mockReturnValue(mockProject);

      const project = await projectService.findOne(projectId);

      expect(project).toEqual(mockProject);
      expect(mockProjectRepository.findOne).toHaveBeenCalledWith(projectId);
    });

    it('should throw NotFoundException if project is not found', async () => {
      const nonExistentId = 'non_existent_id';
      mockProjectRepository.findOne.mockReturnValue(undefined);

      await expect(projectService.findOne(nonExistentId)).rejects.toThrow();
    });
  });

  // Add similar test cases for other service methods (create, update, remove)...

  afterEach(() => {
    jest.clearAllMocks();
  });
});
