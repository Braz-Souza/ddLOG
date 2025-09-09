import * as createCsvWriter from 'csv-writer';
import PDFDocument from 'pdfkit';
import type { Task } from '../../types';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

export class ExportService {
  static async generateCSV(tasks: Task[], _startDate: string, _endDate: string): Promise<Buffer> {
    const tmpFile = join(tmpdir(), `tasks_${Date.now()}.csv`);
    
    const csvWriter = createCsvWriter.createObjectCsvWriter({
      path: tmpFile,
      header: [
        { id: 'name', title: 'Nome' },
        { id: 'description', title: 'Descrição' },
        { id: 'completed', title: 'Concluída' },
        { id: 'category', title: 'Categoria' },
        { id: 'reminderTime', title: 'Lembrete' },
        { id: 'createdAt', title: 'Criada em' },
        { id: 'completedAt', title: 'Concluída em' }
      ]
    });

    const csvData = tasks.map(task => ({
      name: task.name || '',
      description: task.description || '',
      completed: task.completed ? 'Sim' : 'Não',
      category: task.category || '',
      reminderTime: task.reminderTime || '',
      createdAt: new Date(task.createdAt).toLocaleString('pt-BR'),
      completedAt: task.completedAt ? new Date(task.completedAt).toLocaleString('pt-BR') : ''
    }));

    await csvWriter.writeRecords(csvData);
    const buffer = await fs.readFile(tmpFile);
    
    // Clean up temp file
    try {
      await fs.unlink(tmpFile);
    } catch (error) {
      console.warn('Failed to clean up temp CSV file:', error);
    }
    
    return buffer;
  }

  static async generatePDF(tasks: Task[], startDate: string, endDate: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4'
      });
      
      const buffers: Buffer[] = [];
      
      doc.on('data', (chunk) => {
        buffers.push(chunk);
      });
      
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      
      doc.on('error', (error) => {
        reject(error);
      });

      // Header
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .text('Relatório de Tarefas - ddLOG', { align: 'center' });
      
      doc.moveDown(0.5);
      
      // Date range
      const startFormatted = new Date(startDate + 'T00:00:00').toLocaleDateString('pt-BR');
      const endFormatted = new Date(endDate + 'T00:00:00').toLocaleDateString('pt-BR');
      
      doc.fontSize(12)
         .font('Helvetica')
         .text(`Período: ${startFormatted} - ${endFormatted}`, { align: 'center' });
      
      doc.moveDown(1);

      // Summary
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.completed).length;
      const pendingTasks = totalTasks - completedTasks;
      const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : '0';

      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('Resumo:', { underline: true });
      
      doc.moveDown(0.5);
      
      doc.fontSize(12)
         .font('Helvetica')
         .text(`Total de tarefas: ${totalTasks}`)
         .text(`Tarefas concluídas: ${completedTasks}`)
         .text(`Tarefas pendentes: ${pendingTasks}`)
         .text(`Taxa de conclusão: ${completionRate}%`);
      
      doc.moveDown(1.5);

      if (tasks.length === 0) {
        doc.text('Nenhuma tarefa encontrada no período especificado.');
      } else {
        // Task list
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text('Lista de Tarefas:', { underline: true });
        
        doc.moveDown(0.5);

        tasks.forEach((task) => {
          // Check if we need a new page
          if (doc.y > 700) {
            doc.addPage();
          }

          const status = task.completed ? '✓' : '○';
          const statusColor = task.completed ? '#22c55e' : '#6b7280';
          
          doc.fontSize(11)
             .font('Helvetica-Bold')
             .fillColor(statusColor)
             .text(`${status} ${task.name}`, { continued: false });
          
          if (task.description) {
            doc.fontSize(10)
               .font('Helvetica')
               .fillColor('#4b5563')
               .text(`   ${task.description}`, { indent: 15 });
          }

          // Task details
          const createdAt = new Date(task.createdAt).toLocaleDateString('pt-BR');
          let details = `   Criada em: ${createdAt}`;
          
          if (task.category) {
            details += ` | Categoria: ${task.category}`;
          }
          
          if (task.completed && task.completedAt) {
            const completedAt = new Date(task.completedAt).toLocaleDateString('pt-BR');
            details += ` | Concluída em: ${completedAt}`;
          }
          
          if (task.reminderTime) {
            details += ` | Lembrete: ${task.reminderTime}`;
          }

          doc.fontSize(9)
             .font('Helvetica')
             .fillColor('#6b7280')
             .text(details, { indent: 15 });
          
          doc.moveDown(0.8);
        });
      }

      // Footer
      doc.fontSize(8)
         .fillColor('#9ca3af')
         .text(
           `Gerado em ${new Date().toLocaleString('pt-BR')} | ddLOG - Sistema de Gerenciamento de Tarefas`,
           50,
           doc.page.height - 50,
           { align: 'center' }
         );

      doc.end();
    });
  }
}